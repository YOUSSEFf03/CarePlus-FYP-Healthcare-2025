import React, { Suspense } from 'react';
const BreastCancerApp = React.lazy(() => import('../../components/BreastCancerDetection/AppEmbed'));

export default function BreastCancerPage() {
    return (
        <div style={{ padding: 16 }}>
            <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
                <BreastCancerApp />
            </Suspense>
        </div>
    );
}


