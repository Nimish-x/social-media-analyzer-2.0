import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { session, refreshProfile } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id');
            if (!sessionId) {
                setStatus('error');
                setMessage('No session ID found.');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/payment/verify-session`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ session_id: sessionId }),
                });

                if (!response.ok) {
                    throw new Error('Verification failed');
                }

                const data = await response.json();
                if (data.success) {
                    setStatus('success');
                    setMessage('Payment successful! Your plan has been upgraded.');
                    await refreshProfile();
                } else {
                    setStatus('error');
                    setMessage(`Payment status: ${data.status}`);
                }

            } catch (error) {
                setStatus('error');
                setMessage('Failed to verify payment. Please contact support.');
            }
        };

        if (session) {
            verifyPayment();
        }
    }, [searchParams, session, refreshProfile]);

    // Auto-redirect on success to connect accounts
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                navigate('/connect-accounts');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center"
            >
                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Verifying Payment</h2>
                        <p className="text-gray-500 mt-2">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
                        <p className="text-gray-600 mt-2 mb-6">{message}</p>
                        <p className="text-sm text-gray-500 mb-4">Redirecting to connect accounts...</p>
                        <Button onClick={() => navigate('/connect-accounts')} className="w-full">
                            Connect Your Accounts
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
                        <p className="text-red-500 mt-2 mb-6">{message}</p>
                        <Button onClick={() => navigate('/choose-plan')} variant="outline" className="w-full">
                            Return to Plans
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
