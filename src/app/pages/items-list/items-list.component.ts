import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="items-container">
      <h2>Verfügbare Gegenstände</h2>

      @if (loading) {
        <p>Lade Daten...</p>
      }

      @if (error) {
        <p class="error"> {{ error }}</p>
      }

      <div class="items-grid">
        @for (item of items; track item.id) {
          <div class="item-card">
            <h3>{{ item.name }}</h3>
            <p class="inventory">{{ item.inventoryNumber }}</p>
            <p class="category">{{ item.categoryName }}</p>
            <p class="location">{{ item.location }}</p>
            <span class="badge" [class]="'status-' + item.status.toLowerCase()">
              {{ item.status }}
            </span>
            <p class="description">{{ item.description }}</p>
            @if (item.accessories) {
              <p class="accessories">{{ item.accessories }}</p>
            }
          </div>
        }
      </div>

      @if (!loading && items.length === 0) {
        <p>Keine Items gefunden.</p>
      }
    </div>
  `,
  styles: [`
    .items-container {
      padding: 2rem;
    }

    h2 {
      color: #012E58;
      margin-bottom: 2rem;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .item-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: #012E58;
      }

      .inventory {
        font-family: monospace;
        color: #666;
        font-size: 0.875rem;
        margin: 0.25rem 0;
      }

      .category {
        color: #253359;
        font-weight: 500;
        margin: 0.5rem 0;
      }

      .location {
        color: #32424A;
        margin: 0.5rem 0;
      }

      .description {
        color: #666;
        font-size: 0.9rem;
        margin: 1rem 0;
        line-height: 1.4;
      }

      .accessories {
        color: #666;
        font-size: 0.85rem;
        margin: 0.5rem 0;
        font-style: italic;
      }
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0.5rem 0;
    }

    .status-available {
      background: #d4edda;
      color: #155724;
    }

    .status-borrowed {
      background: #fff3cd;
      color: #856404;
    }

    .status-reserved {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-maintenance {
      background: #f8d7da;
      color: #721c24;
    }

    .error {
      color: #C10007;
      background: #fff0f0;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #C10007;
    }
  `]
})
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  loading = false;
  error: string | null = null;

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        console.log('Items geladen:', data);
      },
      error: (err) => {
        this.error = 'Fehler beim Laden der Daten';
        this.loading = false;
        console.error('Fehler:', err);
      }
    });
  }
}
