import AddressInput from '@/components/AddressInput';
import { ProfessionalErrorBoundary } from '@/components/ProfessionalErrorBoundary';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SkipNavigation, MainContent } from '@/components/SkipNavigation';

export default function Home() {
  return (
    <>
      <SkipNavigation 
        skipLinks={[
          { href: '#address-input', label: 'Skip to address input' },
          { href: '#results', label: 'Skip to results' }
        ]}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          {/* Header with theme toggle */}
          <header className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Professional Airdrop Eligibility Checker
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive analysis of your wallet address for airdrop eligibility across blockchain ecosystems, 
                bridge protocols, and social platforms with professional-grade insights.
              </p>
            </div>
            <div className="ml-4">
              <ThemeToggle size="md" />
            </div>
          </header>
          
          <MainContent className="max-w-6xl mx-auto">
            <ProfessionalErrorBoundary>
              <div id="address-input">
                <AddressInput />
              </div>
            </ProfessionalErrorBoundary>
          </MainContent>
        </div>
      </div>
    </>
  );
}