import { Calculator, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">メニュー</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="flex flex-col space-y-4 mt-8">
              <a href="#profile" className="text-lg hover:text-primary transition-colors">
                基本情報
              </a>
              <a href="#assets" className="text-lg hover:text-primary transition-colors">
                資産・負債
              </a>
              <a href="#expenses" className="text-lg hover:text-primary transition-colors">
                支出
              </a>
              <a href="#events" className="text-lg hover:text-primary transition-colors">
                ライフイベント
              </a>
              <a href="#insurance" className="text-lg hover:text-primary transition-colors">
                保険
              </a>
              <a href="#investment" className="text-lg hover:text-primary transition-colors">
                資産運用
              </a>
              <a href="#result" className="text-lg hover:text-primary transition-colors">
                診断結果
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            FP1級レベル ライフプランナー
          </h1>
        </div>
        
        <nav className="hidden md:flex ml-8 space-x-6">
          <a href="#profile" className="text-sm font-medium hover:text-primary transition-colors">
            基本情報
          </a>
          <a href="#assets" className="text-sm font-medium hover:text-primary transition-colors">
            資産・負債
          </a>
          <a href="#expenses" className="text-sm font-medium hover:text-primary transition-colors">
            支出
          </a>
          <a href="#events" className="text-sm font-medium hover:text-primary transition-colors">
            ライフイベント
          </a>
          <a href="#insurance" className="text-sm font-medium hover:text-primary transition-colors">
            保険
          </a>
          <a href="#investment" className="text-sm font-medium hover:text-primary transition-colors">
            資産運用
          </a>
          <a href="#result" className="text-sm font-medium hover:text-primary transition-colors">
            診断結果
          </a>
        </nav>
      </div>
    </header>
  );
}
