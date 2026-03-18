import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Legal: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Privacy Policy",
            icon: Lock,
            content: (
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        <strong>1. Information We Collect:</strong> We collect your name, email address, and learning progress data to provide a personalized experience.
                    </p>
                    <p>
                        <strong>2. How We Use Data:</strong> Your data is used exclusively for educational purposes—tracking your course progress and issuing completion certificates. We do not sell data to third parties.
                    </p>
                    <p>
                        <strong>3. Security:</strong> We use industry-standard encryption (BCrypt) for passwords and secure sessions.
                    </p>
                </div>
            )
        },
        {
            title: "Terms of Service",
            icon: Scale,
            content: (
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        <strong>1. Educational Use Only:</strong> This platform is a Final Year Project designed for educational demonstration. Content is sourced from various open-source contributors.
                    </p>
                    <p>
                        <strong>2. User Conduct:</strong> Users must not attempt to hack, inject malicious scripts, or disrupt the service. Accounts found violating this will be banned.
                    </p>
                    <p>
                        <strong>3. Content Ownership:</strong> All videos and PDFs belong to their respective creators. HexaCore Classes claims no ownership over external content.
                    </p>
                </div>
            )
        },
        {
            title: "Cookie Policy",
            icon: FileText,
            content: (
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <p>
                        We use local storage and session cookies to keep you logged in. By using our site, you agree to this necessary data storage.
                    </p>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Legal & Policies</h1>
                    <p className="text-slate-500 max-w-lg mx-auto">
                        Transparency is key. Here’s everything you need to know about how HexaCore Classes operates.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid gap-6">
                    {sections.map((section, idx) => (
                        <Card key={idx} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <section.icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <CardTitle className="text-xl text-slate-800 dark:text-slate-100">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {section.content}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer */}
                <div className="pt-8 text-center border-t border-slate-200 dark:border-slate-800 mt-12">
                    <p className="text-sm text-slate-400 mb-6">Last updated: January 2026</p>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Close & Go Back
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default Legal;
