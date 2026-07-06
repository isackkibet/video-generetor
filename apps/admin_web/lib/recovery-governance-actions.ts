'use server';

import { apiPost } from './api';
import { requireActionPermission } from './action-guard';
import { redirectError, redirectSuccess } from './action-result';

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

export async function seedRecoveryRepositoriesAction() {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/seed');
    return redirectSuccess('/program-management/data', 'Default repositories seeded successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/data',
      error instanceof Error ? error.message : 'Failed to seed repositories.'
    );
  }
}

export async function createRecoveryRepositoryAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/repositories', {
      code: formValue(formData, 'code'),
      name: formValue(formData, 'name'),
      owner: formValue(formData, 'owner'),
      repositoryPath: formValue(formData, 'repositoryPath')
    });
    return redirectSuccess('/program-management/data', 'Repository created successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/data',
      error instanceof Error ? error.message : 'Failed to create repository.'
    );
  }
}

export async function updateRecoveryRepositoryAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    const id = formValue(formData, 'id');
    await apiPost(`/recovery-governance/repositories/${id}/update`, {
      status: formValue(formData, 'status'),
      alignmentScore: Number(formValue(formData, 'alignmentScore') || 0),
      evidenceSubmitted: formValue(formData, 'evidenceSubmitted') === 'true'
    });
    return redirectSuccess('/program-management/data', 'Repository updated successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/data',
      error instanceof Error ? error.message : 'Failed to update repository.'
    );
  }
}

export async function upsertRecoveryBatchAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/batches', {
      repositoryId: formValue(formData, 'repositoryId'),
      batchNumber: Number(formValue(formData, 'batchNumber')),
      title: formValue(formData, 'title'),
      status: formValue(formData, 'status'),
      evidenceIds: formValue(formData, 'evidenceIds')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      notes: formValue(formData, 'notes')
    });
    return redirectSuccess('/program-management/batches', 'Batch completion updated successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/batches',
      error instanceof Error ? error.message : 'Failed to update batch.'
    );
  }
}

export async function submitRecoveryEvidenceAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/evidence', {
      repositoryId: formValue(formData, 'repositoryId'),
      evidenceCode: formValue(formData, 'evidenceCode'),
      category: formValue(formData, 'category'),
      title: formValue(formData, 'title'),
      description: formValue(formData, 'description'),
      storageUrl: formValue(formData, 'storageUrl'),
      submittedBy: formValue(formData, 'submittedBy')
    });
    return redirectSuccess('/program-management/evidence', 'Evidence submitted successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/evidence',
      error instanceof Error ? error.message : 'Failed to submit evidence.'
    );
  }
}

export async function acceptRecoveryEvidenceAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    const id = formValue(formData, 'id');
    await apiPost(`/recovery-governance/evidence/${id}/accept`);
    return redirectSuccess('/program-management/evidence', 'Evidence accepted successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/evidence',
      error instanceof Error ? error.message : 'Failed to accept evidence.'
    );
  }
}

export async function createRecoveryBlockerAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/blockers', {
      repositoryId: formValue(formData, 'repositoryId'),
      blockerCode: formValue(formData, 'blockerCode'),
      title: formValue(formData, 'title'),
      description: formValue(formData, 'description'),
      severity: formValue(formData, 'severity'),
      owner: formValue(formData, 'owner')
    });
    return redirectSuccess('/program-management/blockers', 'Blocker created successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/blockers',
      error instanceof Error ? error.message : 'Failed to create blocker.'
    );
  }
}

export async function updateRecoveryBlockerAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    const id = formValue(formData, 'id');
    await apiPost(`/recovery-governance/blockers/${id}/update`, {
      status: formValue(formData, 'status'),
      resolution: formValue(formData, 'resolution')
    });
    return redirectSuccess('/program-management/blockers', 'Blocker updated successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/blockers',
      error instanceof Error ? error.message : 'Failed to update blocker.'
    );
  }
}

export async function createRecoveryRiskAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/risks', {
      repositoryId: formValue(formData, 'repositoryId'),
      riskCode: formValue(formData, 'riskCode'),
      title: formValue(formData, 'title'),
      description: formValue(formData, 'description'),
      severity: formValue(formData, 'severity'),
      mitigation: formValue(formData, 'mitigation'),
      owner: formValue(formData, 'owner')
    });
    return redirectSuccess('/program-management/risks', 'Risk created successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/risks',
      error instanceof Error ? error.message : 'Failed to create risk.'
    );
  }
}

export async function updateRecoveryRiskAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    const id = formValue(formData, 'id');
    await apiPost(`/recovery-governance/risks/${id}/update`, {
      status: formValue(formData, 'status'),
      resolution: formValue(formData, 'resolution')
    });
    return redirectSuccess('/program-management/risks', 'Risk updated successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/risks',
      error instanceof Error ? error.message : 'Failed to update risk.'
    );
  }
}

export async function approveRecoveryCertificationAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/certifications', {
      repositoryId: formValue(formData, 'repositoryId'),
      certificationType: formValue(formData, 'certificationType'),
      decision: formValue(formData, 'decision'),
      reviewer: formValue(formData, 'reviewer'),
      comments: formValue(formData, 'comments')
    });
    return redirectSuccess('/program-management/certification', 'Certification decision recorded.');
  } catch (error) {
    return redirectError(
      '/program-management/certification',
      error instanceof Error ? error.message : 'Failed to record certification.'
    );
  }
}

export async function recordExecutiveApprovalAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/recovery-governance/executive-approvals', {
      releaseVersion: formValue(formData, 'releaseVersion'),
      decision: formValue(formData, 'decision'),
      approver: formValue(formData, 'approver'),
      comments: formValue(formData, 'comments')
    });
    return redirectSuccess('/program-management/executive', 'Executive approval recorded.');
  } catch (error) {
    return redirectError(
      '/program-management/executive',
      error instanceof Error ? error.message : 'Failed to record executive approval.'
    );
  }
}
