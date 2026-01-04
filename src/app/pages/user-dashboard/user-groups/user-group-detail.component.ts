import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BackButtonComponent } from '../../../components/buttons/back-button/back-button.component';
import { GroupInfoCardComponent } from '../../../components/user/group-info-card/group-info-card.component';
import { GroupStatsCardComponent } from '../../../components/user/group-stats-card/group-stats-card.component';
import { GroupMembersCardComponent } from '../../../components/user/group-members-card/group-members-card.component';
import { UserGroupDetailService } from './page-services/user-group-detail.service';

@Component({
  selector: 'app-user-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    BackButtonComponent,
    GroupInfoCardComponent,
    GroupStatsCardComponent,
    GroupMembersCardComponent
  ],
  templateUrl: './user-group-detail.component.html',
  styleUrls: ['./user-group-detail.component.scss'],
  providers: [UserGroupDetailService]
})
export class UserGroupDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly pageService = inject(UserGroupDetailService);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : Number.NaN;

    if (Number.isNaN(id)) {
      this.pageService.error.set('Ungültige Gruppen-ID');
    } else {
      this.pageService.loadGroup(id);
    }
  }

  goBack() {
    this.pageService.goBack();
  }
}

