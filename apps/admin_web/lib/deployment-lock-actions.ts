'use server';

import { apiPost } from './api';
import { requireActionPermission } from './action-guard';
import { redirectError, redirectSuccess } from './action-result';

function value(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim();
}

export async function createDeploymentLockAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/production-deployment-lock', {
      releaseVersion: value(formData, 'releaseVersion'),
      evidenceBundleId: value(formData, 'evidenceBundleId'),
      executiveDecision: value(formData, 'executiveDecision'),
      authorizationSigned: value(formData, 'authorizationSigned') === 'true',
      authorizedBy: value(formData, 'authorizedBy'),
      authorizationReference: value(formData, 'authorizationReference'),
      notes: value(formData, 'notes'),
    });
    return redirectSuccess('/program-management/deployment-lock', 'Deployment lock recorded successfully.');
  } catch (error) {
    return redirectError(
      '/program-management/deployment-lock',
      error instanceof Error ? error.message : 'Failed to record deployment lock.'
    );
  }
}

export async function validateDeploymentLockAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    const releaseVersion = value(formData, 'releaseVersion');
    await apiPost(`/production-deployment-lock/${releaseVersion}/validate`);
    return redirectSuccess('/program-management/deployment-lock', 'Deployment lock validated. Release is GO.');
  } catch (error) {
    return redirectError(
      '/program-management/deployment-lock',
      error instanceof Error ? error.message : 'Deployment lock validation failed.'
    );
  }
}

export async function markDeploymentDeployedAction(formData: FormData) {
  try {
    await requireActionPermission('ADMIN');
    await apiPost('/production-deployment-lock/mark-deployed', {
      releaseVersion: value(formData, 'releaseVersion'),
      deploymentEvidenceRef: value(formData, 'deploymentEvidenceRef'),
    });
    return redirectSuccess('/program-management/deployment-lock', 'Deployment marked as deployed.');
  } catch (error) {
    return redirectError(
      '/program-management/deployment-lock',
      error instanceof Error ? error.message : 'Failed to mark deployment.'
    );
  }
}
