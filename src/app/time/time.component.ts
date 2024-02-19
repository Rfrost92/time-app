import { Component, OnInit } from '@angular/core';
import { ProductService } from '../product/product.service';
import { Product } from '../product/product.interface';
import {interval, Subscription, takeWhile} from "rxjs";

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit {
  currentTime: string = '';
  products: Product[] = [];
  categoryCounts: { [key: string]: number } = {};
  automaticUpdateEnabled: boolean = true;
  private alive: boolean = true;
  private intervalSubscription: Subscription | null;
  appleProducts: Product[] = [];


  constructor(private productService: ProductService) {
    this.intervalSubscription = null;
  }

  ngOnInit(): void {
    this.updateTime();
    this.refreshData();
    this.startAutomaticUpdate();
  }

  ngOnDestroy(): void {
    this.alive = false;
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  refreshData() {
    this.updateTime();
    this.productService.getProducts().subscribe(response => {
      this.products = response.products;
      this.calculateCategoryCounts();
      this.filterAppleProducts();
    });
  }

  calculateCategoryCounts() {
    this.categoryCounts = this.products.reduce((counts: { [key: string]: number }, product: Product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {});
  }

  toggleAutomaticUpdate() {
    this.automaticUpdateEnabled = !this.automaticUpdateEnabled;
    if (this.automaticUpdateEnabled) {
      this.startAutomaticUpdate();
    } else {
      this.stopAutomaticUpdate();
    }
  }

  startAutomaticUpdate() {
    if (!this.intervalSubscription) {
      this.intervalSubscription = interval(60000)
        .pipe(takeWhile(() => this.alive))
        .subscribe(() => {
          if (this.automaticUpdateEnabled) {
            this.refreshData();
          }
        });
    }
  }

  stopAutomaticUpdate() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
  }

  filterAppleProducts() {
    this.appleProducts = this.products.filter(product => product.brand === 'Apple');
  }
}
