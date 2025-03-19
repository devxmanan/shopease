import { useAuth } from '@/context/AuthContext';
import { getAllDocuments } from '@/lib/firebase';
import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';

const MyAccount = () => {
    const { currentUser } = useAuth();

    const [user, setUser] = useState<any>();
    const fetchUser = async () => {
        const users = await getAllDocuments("users")
        setUser(users.find((user: any) => user.uid === currentUser?.uid))
    }
    useEffect(() => {
        fetchUser();
    })

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
                <h1 className="text-3xl font-bold mb-4 text-center">My Account</h1>
                <div className="space-y-2 my-6">
                    <p className="text-gray-700">
                        {/* <strong>Name:</strong> {user.name} */}
                    </p>
                    <p className="text-gray-700">
                        <strong>Email:</strong> {user?.email}
                    </p>
                    <p className="text-gray-700">
                        <strong>UID:</strong> {user?.uid}
                    </p>
                </div>
                <Link href='/orders'
                    className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    View Orders
                </Link>
            </div>
        </div>
    );
};

export default MyAccount;
