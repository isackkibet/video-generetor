import { Injectable } from '@nestjs/common';
import { RecoveryGovernanceService } from './recovery-governance.service';

@Injectable()
export class ProgramManagementService {
  constructor(private readonly recoveryGovernanceService: RecoveryGovernanceService) {}

  async getDashboard() {
    return this.recoveryGovernanceService.dashboard();
  }
}
