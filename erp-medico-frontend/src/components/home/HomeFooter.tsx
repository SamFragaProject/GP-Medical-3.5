import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Heart } from 'lucide-react';

export function HomeFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            GPMedical
                        </h3>
                        <p className="text-blue-200 mb-6 leading-relaxed">
                            El ERP médico más avanzado para medicina del trabajo, potenciado por inteligencia artificial.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Facebook, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Linkedin, href: '#' },
                                { icon: Instagram, href: '#' },
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                                >
                                    <social.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Product Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className="text-lg font-bold mb-4">Producto</h4>
                        <ul className="space-y-3">
                            {[
                                'Características',
                                'Inteligencia Artificial',
                                'Precios',
                                'Casos de Éxito',
                                'Integraciones',
                                'Actualizaciones',
                            ].map((item, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-blue-200 hover:text-white transition-colors hover:underline"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Company Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="text-lg font-bold mb-4">Empresa</h4>
                        <ul className="space-y-3">
                            {[
                                'Nosotros',
                                'Blog',
                                'Carreras',
                                'Prensa',
                                'Socios',
                                'Contacto',
                            ].map((item, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-blue-200 hover:text-white transition-colors hover:underline"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className="text-lg font-bold mb-4">Contacto</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-blue-200">Email</p>
                                    <a href="mailto:contacto@gpmedical.com" className="text-white hover:underline">
                                        contacto@gpmedical.com
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-blue-200">Teléfono</p>
                                    <a href="tel:+525512345678" className="text-white hover:underline">
                                        +52 55 1234 5678
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-blue-200">Ubicación</p>
                                    <p className="text-white">Ciudad de México, México</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <p className="text-blue-200 text-sm text-center md:text-left">
                            © {currentYear} GPMedical. Todos los derechos reservados.
                        </p>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <a href="#" className="text-blue-200 hover:text-white transition-colors hover:underline">
                                Privacidad
                            </a>
                            <a href="#" className="text-blue-200 hover:text-white transition-colors hover:underline">
                                Términos de Servicio
                            </a>
                            <a href="#" className="text-blue-200 hover:text-white transition-colors hover:underline">
                                Cookies
                            </a>
                        </div>

                        {/* Made with love */}
                        <div className="flex items-center gap-2 text-blue-200 text-sm">
                            <span>Hecho con</span>
                            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                            <span>en México</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
