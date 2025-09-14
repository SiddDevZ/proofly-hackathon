"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { BACKEND_URL, FRONTEND_URL } from "../../../lib/config";
import "remixicon/fonts/remixicon.css";

const page = () => {
  const [student, setStudent] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingCredentialId, setSharingCredentialId] = useState(null);
  const [downloadingCredentialId, setDownloadingCredentialId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const verifyAndLoadStudent = async () => {
      const token = localStorage.getItem('proofly_student_token');
      
      if (!token) {
        router.push('/student/login');
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/student/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        if (data.valid) {
          setStudent(data.student);
          // Fetch real credentials from API
          try {
            const credsResponse = await fetch(`${BACKEND_URL}/api/credentials/student`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (credsResponse.ok) {
              const credsData = await credsResponse.json();
              setCredentials(credsData);
            } else {
              console.error('Failed to fetch credentials');
              setCredentials([]);
            }
            
          } catch (credError) {
            console.error('Error fetching credentials:', credError);
            setCredentials([]);
          }

        } else {
          localStorage.removeItem('proofly_student_token');
          router.push('/student/login');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('proofly_student_token');
        router.push('/student/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoadStudent();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('proofly_student_token');
    router.push('/');
  };

  const handleShare = async (credential) => {
    setSharingCredentialId(credential._id);
    
    try {
      const shareUrl = `${FRONTEND_URL}/validate?q=${credential.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Validation link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy link. Please try again.');
    } finally {
      setSharingCredentialId(null);
    }
  };

  const handleDownload = async (credential) => {
    setDownloadingCredentialId(credential._id);
    
    try {
      const token = localStorage.getItem('proofly_student_token');
      const response = await fetch(`${BACKEND_URL}/api/credentials/download/${credential._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use the status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${credential.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(error.message || 'Failed to download certificate. Please try again.');
    } finally {
      setDownloadingCredentialId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-inter">
        <header className="border-b border-white/10 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
                <span className="text-gray-400">|</span>
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse mb-1"></div>
                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-white/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="h-12 w-80 bg-white/10 rounded animate-pulse mx-auto mb-6"></div>
              <div className="h-6 w-96 bg-white/10 rounded animate-pulse mx-auto"></div>
            </div>
            
            <div className="flex items-center justify-center space-x-12">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white/10 rounded-full animate-pulse"></div>
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white/10 rounded-full animate-pulse"></div>
                <div className="h-4 w-28 bg-white/10 rounded animate-pulse"></div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-white/10 rounded-full animate-pulse"></div>
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
              >
                <div className="h-60 w-full bg-white/10 animate-pulse"></div>

                <div className="p-6">
                  <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse mb-4"></div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="h-4 w-40 bg-white/10 rounded animate-pulse"></div>
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white/10 rounded-full animate-pulse"></div>
                          <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-12 bg-white/10 rounded animate-pulse"></div>
                          <div className="h-3 w-20 bg-white/10 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
                          <div className="h-3 w-24 bg-white/10 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-1 h-10 bg-white/10 rounded-xl animate-pulse"></div>
                    <div className="flex-1 h-10 bg-white/10 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold">
                Proofly
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300 sm:block hidden">Student Vault</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium">{student.name}</p>
                <p className="text-xs text-gray-400">{student.universityName || 'No University'}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center sm:space-x-2 sm:px-4 px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition duration-300"
              >
                <i className="ri-logout-circle-line"></i>
                <span className="sm:block hidden">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Your Credential Vault
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Securely stored and verified. Share instantly with employers, download for portfolios.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-12">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/30"></div>
              <span className="text-sm font-medium text-gray-300">
                {credentials.length} {credentials.length === 1 ? 'Credential' : 'Credentials'} Secured
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-[#fbda02] rounded-full shadow-lg shadow-[#fbda02]/30"></div>
              <span className="text-sm font-medium text-gray-300">Blockchain Verified</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/30"></div>
              <span className="text-sm font-medium text-gray-300">
                {credentials.filter(c => c.blockchainTxHash).length} On-Chain
              </span>
            </div>
          </div>
        </div>

        {credentials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {credentials.map((credential) => (
              <div
                key={credential._id}
                className="group bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
              >

                <div className="h-60 w-full relative overflow-hidden bg-white/3">
                  <Image
                    src={`${BACKEND_URL}/${credential.imagePath}`}
                    alt={credential.title}
                    fill
                    className="object-cover transition-transform duration-500"
                  />

                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-green-500/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4 leading-tight text-white">
                    {credential.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-building-line text-xs text-gray-400"></i>
                      </div>
                      <span className="truncate">
                        {credential.university?.universityName || 'Unknown University'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-calendar-line text-xs text-gray-400"></i>
                      </div>
                      <span>
                        {new Date(credential.issueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-start text-gray-300 text-sm">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <i className="ri-fingerprint-line text-xs text-gray-400"></i>
                      </div>
                      <span className="text-xs font-mono text-gray-400 leading-relaxed">
                        {credential.credentialHash?.substring(0, 24)}...
                      </span>
                    </div>

                    {/* Blockchain Status Section */}
                    <div className="pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Blockchain Status</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${credential.blockchainTxHash ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <span className="text-xs text-gray-300">
                            {credential.blockchainTxHash ? 'Verified' : 'Legacy'}
                          </span>
                        </div>
                      </div>
                      
                      {credential.blockchainTxHash ? (
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Network:</span>
                            <span className="text-gray-300">Polygon Amoy</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Transaction:</span>
                            <button
                              onClick={() => window.open(`https://amoy.polygonscan.com/tx/${credential.blockchainTxHash}`, '_blank')}
                              className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors flex items-center space-x-1"
                            >
                              <span className="font-mono">{credential.blockchainTxHash.slice(0, 6)}...{credential.blockchainTxHash.slice(-4)}</span>
                              <i className="ri-external-link-line"></i>
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Verification ID:</span>
                            <span className="font-mono text-gray-300">{credential.slug}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-400">
                            This credential was issued before blockchain integration.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleShare(credential)}
                      disabled={sharingCredentialId === credential._id}
                      className="flex-1 px-4 cursor-pointer py-2.5 bg-[#fbda02] text-black text-sm font-semibold rounded-xl hover:bg-[#e8c602] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <i className={`ri-share-line ${sharingCredentialId === credential._id ? 'animate-pulse' : ''}`}></i>
                      <span>{sharingCredentialId === credential._id ? 'Copying...' : 'Share'}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleDownload(credential)}
                      disabled={downloadingCredentialId === credential._id}
                      className="flex-1 px-4 cursor-pointer py-2.5 bg-white/8 hover:bg-white/12 text-white text-sm font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <i className={`ri-download-line ${downloadingCredentialId === credential._id ? 'animate-pulse' : ''}`}></i>
                      <span>{downloadingCredentialId === credential._id ? 'Downloading...' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-24">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center shadow-2xl">
              <i className="ri-folder-open-line text-5xl text-gray-400"></i>
            </div>
            
            <h3 className="text-3xl font-bold mb-4 text-white">Your Vault is Empty</h3>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Once your university issues credentials, they'll appear here securely stored and ready to share.
            </p>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <i className="ri-shield-check-line"></i>
                <span>Secure Storage</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-share-line"></i>
                <span>Instant Sharing</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-download-line"></i>
                <span>Easy Download</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Proofly. Secured by blockchain technology.
            </p>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition duration-300">
                <i className="ri-question-line"></i>
              </button>
              
              <button className="text-gray-400 hover:text-white transition duration-300">
                <i className="ri-settings-3-line"></i>
              </button>
            </div>
          </div>
        </div>
      </footer>
              <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
};

export default page; 