import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
export default function Footer() {
    return (
        <>
            {/* Footer */}
            <footer className="relative z-10 bg-black border-t border-white/10">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">Anilyst</h3>
                            <p className="text-gray-400">Advanced AI-powered data analysis platform for modern businesses.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#docs" className="text-gray-400 hover:text-white transition-colors">
                                        Documentation
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                                        About
                                    </Link>
                                </li>
                               
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Connect</h4>
                            <div className="flex space-x-4">
                                <Link href="https://github.com/kaif9999/" className="text-gray-400 hover:text-white transition-colors">
                                    <Github className="w-5 h-5" />
                                </Link>
                                <Link href="https://x.com/kaif9998" className="text-gray-400 hover:text-white transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </Link>
                               
                                <Link href="mailto:kaifmohd5000@gmail.com?subject=Anilyst Inquiry&body=Hello,%0D%0A%0D%0AI'm interested in learning more about Anilyst." className="text-gray-400 hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                </Link> 
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8">
                        <p className="text-center text-gray-400 text-sm">
                            © {new Date().getFullYear()} Anilyst. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    )
}
