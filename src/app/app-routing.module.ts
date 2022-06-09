import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/authGuard.service';
import { TabsPageModule } from './tabs/tabs.module';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: 'login',loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)},
  {path: 'tabs',canActivate: [AuthGuardService], loadChildren:()=>import ('./tabs/tabs.module').then(m=>m.TabsPageModule)},
  {path: 'tab1',loadChildren: () => import('./tab1/tab1.module').then(m => m.Tab1PageModule)},
  {path: 'tab2',loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule)},

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
