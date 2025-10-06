import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatButtonModule } from "@angular/material/button";

@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  selector: "tos-page",
  templateUrl: "./tos.component.html",
  styleUrls: ["./tos.component.scss"],
})
export class TosComponent implements OnInit {
  revealed = false;
  constructor(private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle("Fumes - Terms of Service");
  }
}
