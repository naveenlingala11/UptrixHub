import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { XpRule, XpRuleAdminService } from "../../services/xp-rule-admin.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-xp-rules.component.html'
})
export class AdminXpRulesComponent {

  rules: XpRule[] = [];
  editing: XpRule | null = null;

  form: XpRule = {
    gameType: 'BUG_HUNTER',
    action: 'CORRECT',
    xp: 10,
    enabled: true
  };

  constructor(private service: XpRuleAdminService) {
    this.load();
  }

  load() {
    this.service.list().subscribe(r => this.rules = r);
  }

  edit(r: XpRule) {
    this.editing = r;
    this.form = { ...r };
  }

  save() {
    if (this.editing) {
      this.service.update(this.editing.id!, this.form)
        .subscribe(() => this.done());
    } else {
      this.service.create(this.form)
        .subscribe(() => this.done());
    }
  }

  done() {
    this.editing = null;
    this.form = {
      gameType: 'BUG_HUNTER',
      action: 'CORRECT',
      xp: 10,
      enabled: true
    };
    this.load();
  }

  delete(id: number) {
    if (confirm('Delete rule?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}
