import { useSession } from 'next-auth/react'


const LibraryPage = () => {
    console.log("LibraryPage component is being rendered!");
    return (
        <div className="text-2xl text-black p-8 min-h-screen flex items-center justify-center"> 
            Welcome to the Library Page! 
        </div>
    );
};

export default LibraryPage;