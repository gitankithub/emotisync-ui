import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export interface RequestAnalysis {
  requestId: string;
  summary: string;
  guestSentimentScore: number | null;
  guestAttitude: string | null;
  staffSentimentScore: number | null;
  staffAttitude: string | null;
  slaBreached: boolean;
  mainComplaint: string | null;
  improvementSuggestion: string | null;
  escalationReason: string | null;
  responseDelayMinutes: number | null;
  emotionalKeywords: string[];
}


@Component({
  selector: 'app-request-analysis',
  templateUrl: './request-analysis.component.html',
  styleUrls: ['./request-analysis.component.css'],
  imports: [MatCardModule, NgIf, NgClass, MatChipsModule],
})
export class RequestAnalysisComponent {
  @Input() analysis: RequestAnalysis | null = null;
}
