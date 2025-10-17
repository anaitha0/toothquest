 
import './globals.css';
import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/shared/navbar';
import Footer from '../components/shared/footer';

export const metadata: Metadata = {
  title: 'ToothQuest - Dental Exams Platform',
  description: 'Study smarter, score higher with ToothQuest - The ultimate dental MCQ platform for dental students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      
      <body>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}