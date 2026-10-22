import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section I · I2
export default function OnboardingPage() {
  const t = getT('onboarding');
  return <ComingSoon section="I" title={t('pages.onboarding.title')} tasks="I2" />;
}
