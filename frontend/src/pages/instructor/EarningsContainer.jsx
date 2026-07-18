import Header from '@/components/molecules/header/Header';
import EarningsSummary from '@/components/organisms/instructor/EarningsSummary';
import { useEarningsSummary } from '@/hooks/apis/payment/useEarningsSummary';

const EarningsContainer = () => {
  const { earnings, isLoading } = useEarningsSummary();

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <EarningsSummary earnings={earnings} isLoading={isLoading} />
    </div>
  );
};

export default EarningsContainer;
