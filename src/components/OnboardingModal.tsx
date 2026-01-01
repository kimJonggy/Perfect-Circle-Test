import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const ONBOARDING_KEY = 'perfect_circle_onboarded';

interface OnboardingModalProps {
    forceShow?: boolean;
    onClose?: () => void;
}

export function OnboardingModal({ forceShow = false, onClose }: OnboardingModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show modal on first visit
        if (forceShow) {
            setIsOpen(true);
        } else {
            const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
            if (!hasOnboarded) {
                setIsOpen(true);
            }
        }
    }, [forceShow]);

    const handleClose = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsOpen(false);
        onClose?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        🎯 Welcome to Perfect Circle
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 text-center text-base">
                        Test your precision and mint your achievement onchain!
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                            1
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Draw a Circle</h4>
                            <p className="text-sm text-gray-400">
                                Use your finger or mouse to draw the most perfect circle you can on the canvas.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                            2
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Get Your Score</h4>
                            <p className="text-sm text-gray-400">
                                We'll analyze your circle for roundness, completeness, and symmetry.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                            3
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Mint Your Report Card</h4>
                            <p className="text-sm text-gray-400">
                                Happy with your score? Mint it as an NFT on Base to show off your skills!
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleClose}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 min-h-[48px]"
                    >
                        Let's Draw! ✏️
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
