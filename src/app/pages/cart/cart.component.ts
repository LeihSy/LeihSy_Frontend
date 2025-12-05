import { Component } from '@angular/core';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold">Cart Page</h1>
      <p class="text-muted-foreground">This page will show the user's shopping cart.</p>
    </div>
  `,
})
export class CartPageComponent {
  //   cart logik hier einfügen
}
