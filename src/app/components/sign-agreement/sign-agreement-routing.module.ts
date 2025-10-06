import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SignAgreementComponent } from "./sign-agreement.component";

const routes: Routes = [
  {
    path: ":agreementId",
    component: SignAgreementComponent,
  },
  {
    path: "**",
    component: SignAgreementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignAgreementRoutingModule {}
