'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { signIn, signOut, useSession, getProviders, LiteralUnion, ClientSafeProvider } from 'next-auth/react';
import { BuiltInProviderType } from 'next-auth/providers/index';
import '../styles/css/Navbar.css';

const Navbar = () => {
    const { data: session } = useSession();

    const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null>(null);

    useEffect(() => {
        const setUpProviders = async () => {
            const response = await getProviders();

            setProviders(response);
        };

        setUpProviders();
    }, []);

    return (
        <nav className='Nav'>
            <div className='Nav__content'>
                <Link href='/'>
                    <p className='Nav__logo'>Map</p>
                </Link>

                <div className='Nav__session'>
                    {session?.user ? (
                        <div className='Nav__signOut'>
                            <Link href='/'>
                                <Image
                                    src={session?.user.image as string}
                                    width={37}
                                    height={37}
                                    className='Nav__profilePic'
                                    alt='profile'
                                />
                            </Link>
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.preventDefault();
                                    signOut();
                                }}
                                className='Nav__signOut-btn'
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            {providers &&
                                Object.values(providers).map((provider) => (
                                    <button
                                        type='button'
                                        key={provider.name}
                                        onClick={() => signIn(provider.id)}
                                        className='Nav__signIn-btn'
                                    >
                                        Sign In
                                    </button>
                                ))}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
