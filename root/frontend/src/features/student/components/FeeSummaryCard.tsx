interface FeeSummaryProps {
    totalCredits: number;
    programmeFee: number;
    excessFee: number;
}

export default function FeeSummary({
    totalCredits = 0,
    programmeFee = 0,
    excessFee = 150
}: Partial<FeeSummaryProps>) {
    
    const totalPayable = programmeFee + excessFee;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-5 text-gray-900 w-full max-w-xs h-fit">

            <div className="space-y-5">
                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Programme Fee</span>
                    <span className="block font-medium text-base">{formatCurrency(programmeFee)}</span>
                </div>

                <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Excess Fee</span>
                    <span className="block font-medium text-base">{formatCurrency(excessFee)}</span>
                </div>

                <div className="border-t border-gray-200 pt-5 mt-2">
                    <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount Due</span>
                    <span className="block font-bold text-xl">{formatCurrency(totalPayable)}</span>
                </div>

            </div>
        </div>
    );
}