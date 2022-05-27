import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children:[
      {
        path:'tab1',  
        loadChildren: ()=>import('../tab1/tab1.module').then(m=>m.Tab1PageModule)
      },
      { 
        path: 'setting',
        loadChildren: ()=>import('../setting/setting.module').then(m=>m.SettingPageModule)
      },
  ]
  },
  {
    path:'',
    redirectTo:'tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
