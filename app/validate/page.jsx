"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { BACKEND_URL } from "../../lib/config";
import "remixicon/fonts/remixicon.css";

// Loading component for Suspense fallback
const ValidatePageLoading = () => {
  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold font-['Poppins',sans-serif]">Proofly</Link>
              <span className="text-[#c2c2c2]">|</span>
              <span className="text-gray-300 font-['DM_Sans',sans-serif]">Certificate Validator</span>
            </div>
            
            <div className="items-center sm:flex hidden space-x-4">
              <Link href="/student/login" className="text-sm text-gray-300 hover:text-white transition duration-300 font-['DM_Sans',sans-serif]">
                Student Login
              </Link>
              <Link href="/university/login" className="text-sm text-gray-300 hover:text-white transition duration-300 font-['DM_Sans',sans-serif]">
                University Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-['Poppins',sans-serif]">
            Certificate Validator
          </h1>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto font-['DM_Sans',sans-serif] leading-relaxed">
            Loading validation page...
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-white/5 rounded w-48 mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-full mb-6"></div>
                <div className="h-48 bg-white/5 rounded-lg"></div>
                <div className="h-12 bg-white/5 rounded-lg"></div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 h-full">
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full"></div>
                  <div>
                    <div className="h-5 bg-white/5 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-white/5 rounded w-48"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-white/5 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-white/5 rounded w-36 mb-1"></div>
                  <div className="h-3 bg-white/5 rounded w-48"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ValidatePage = () => {
  const [certificateFile, setCertificateFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const fileInputRef = useRef(null);
  const searchParams = useSearchParams();

  // Cleanup image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  // Check for URL parameter validation on mount
  useEffect(() => {
    const slug = searchParams.get('q');
    if (slug) {
      validateBySlug(slug);
    }
  }, [searchParams]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setCertificateFile(file);
      setValidationResult(null); // Reset previous results
      
      // Create image preview if it's an image file
      if (file.type.startsWith('image/')) {
        // Cleanup previous preview
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setFileName(file.name);
      setCertificateFile(file);
      setValidationResult(null);
      
      // Create image preview if it's an image file
      if (file.type.startsWith('image/')) {
        // Cleanup previous preview
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  const validateBySlug = async (slug) => {
    setIsLoadingFromUrl(true);
    setValidationResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/credentials/validate-by-slug/${slug}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
        
        // Set the certificate image if available
        if (data.valid && data.credential && data.credential.imagePath) {
          const imageUrl = `${BACKEND_URL}/${data.credential.imagePath}`;
          setImagePreview(imageUrl);
          setFileName(data.credential.title + '.png');
        }
        
                                toast.success(`Validation complete for credential: ${data.credential?.title || slug}`);
                      } else {
                        setValidationResult({
                          valid: false,
                          message: data.error || `No credential found with ID: ${slug}`,
                          searchSlug: slug
                        });
                        toast.error(`Credential not found: ${slug}`);
      }
    } catch (error) {
      console.error("Validation by slug error:", error);
      setValidationResult({
        valid: false,
        message: `Failed to validate credential with ID: ${slug}`
      });
      toast.error("An error occurred while validating the credential.");
    } finally {
      setIsLoadingFromUrl(false);
    }
  };

  const handleValidation = async (e) => {
    e.preventDefault();
    
    if (!certificateFile) {
      toast.error("Please select a certificate file to validate.");
      return;
    }

    setValidating(true);
    const formData = new FormData();
    formData.append('certificate', certificateFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/credentials/validate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("An error occurred while validating the certificate.");
    } finally {
      setValidating(false);
    }
  };

  const resetValidation = () => {
    setCertificateFile(null);
    setFileName("");
    setValidationResult(null);
    setIsLoadingFromUrl(false);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);

    // Clear URL parameter by updating the URL without the query
    if (searchParams.get('q')) {
      window.history.replaceState({}, '', '/validate');
    }
  };

  const ValidationPreview = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 sm:flex hidden bg-white/5 rounded-full items-center justify-center border-2 border-dashed border-white/20">
          <i className={`${isLoadingFromUrl ? 'ri-loader-4-line animate-spin' : 'ri-shield-line'} text-white/40 text-xl`}></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white/60 font-['Poppins',sans-serif]">
            {isLoadingFromUrl ? 'Validating Credential...' : 'Ready to Validate'}
          </h3>
          <p className="text-sm text-[#c2c2c2] font-['DM_Sans',sans-serif]">
            {isLoadingFromUrl ? 'Fetching credential details from database' : 'Upload your certificate to see verification details'}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="h-3 bg-white/5 rounded w-24 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-full"></div>
        </div>
        
        <div>
          <div className="h-3 bg-white/5 rounded w-16 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-36 mb-1"></div>
          <div className="h-3 bg-white/5 rounded w-48"></div>
        </div>
        
        <div>
          <div className="h-3 bg-white/5 rounded w-20 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-40"></div>
        </div>
        
        <div>
          <div className="h-3 bg-white/5 rounded w-20 mb-2"></div>
          <div className="h-4 bg-white/5 rounded w-28"></div>
        </div>
        
        <div>
          <div className="h-3 bg-white/5 rounded w-28 mb-2"></div>
          <div className="h-16 bg-white/5 rounded w-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold font-['Poppins',sans-serif]">Proofly</Link>
              <span className="text-[#c2c2c2]">|</span>
              <span className="text-gray-300 font-['DM_Sans',sans-serif]">Certificate Validator</span>
            </div>
            
            <div className="items-center sm:flex hidden space-x-4">
              <Link href="/student/login" className="text-sm text-gray-300 hover:text-white transition duration-300 font-['DM_Sans',sans-serif]">
                Student Login
              </Link>
              <Link href="/university/login" className="text-sm text-gray-300 hover:text-white transition duration-300 font-['DM_Sans',sans-serif]">
                University Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 font-['Poppins',sans-serif]">
            Certificate Validator
          </h1>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto font-['DM_Sans',sans-serif] leading-relaxed">
            Verify the authenticity of academic credentials by uploading the certificate image. 
            We'll check its cryptographic hash against our secure blockchain database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-0.5 font-['Poppins',sans-serif]">
                {searchParams.get('q') ? 'Validating Credential' : 'Upload Certificate'}
              </h2>
              <p className="text-[#b1b1b1] mb-6 font-dm-sans">
                {searchParams.get('q') ? 
                  `Validating credential with ID: ${searchParams.get('q')}` : 
                  'Upload the certificate image you want to validate.'
                }
              </p>
              
              <form onSubmit={handleValidation} className="space-y-6">
                <div>
                  {/* <label className="block text-sm font-medium text-gray-300 mb-2 font-['Inter',sans-serif]">Certificate Image</label> */}
                  <div 
                    className="relative flex items-center justify-center w-full sm:h-79 h-48 bg-white/5 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors overflow-hidden"
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg, application/pdf, image/webp"
                    />
                    
                    {imagePreview ? (
                      <div className="relative w-full h-full group">
                        <Image
                          src={imagePreview}
                          alt="Certificate preview"
                          fill
                          className="object-contain opacity-90"
                        />
                        {/* {searchParams.get('q') ? (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center text-white bg-black/70 rounded-lg p-4">
                              <i className="ri-eye-line text-2xl mb-2"></i>
                              <p className="text-sm font-['DM_Sans',sans-serif]">Loaded from credential ID</p>
                              <p className="text-xs text-gray-300 font-['Inter',sans-serif]">{fileName}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center text-white">
                              <i className="ri-upload-cloud-2-line text-2xl mb-2"></i>
                              <p className="text-sm font-['DM_Sans',sans-serif]">Click to change file</p>
                              <p className="text-xs text-gray-300 font-['Inter',sans-serif]">{fileName}</p>
                            </div>
                          </div>
                        )} */}
                      </div>
                    ) : (
                      <div className="text-center">
                        <i className="ri-upload-cloud-2-line text-4xl text-[#c2c2c2] mb-4"></i>
                        <p className="text-sm text-[#c2c2c2] mb-2 font-['DM_Sans',sans-serif]">
                          {fileName ? (
                            <span className="text-white font-medium">{fileName}</span>
                          ) : (
                            "Drag and drop or click to upload"
                          )}
                        </p>
                        <p className="text-xs text-gray-500 font-['Inter',sans-serif]">
                          Supports PNG, JPG, PDF files
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={validating || isLoadingFromUrl || !certificateFile}
                    className="flex-1 py-3 cursor-pointer bg-[#fbda02] text-black font-semibold rounded-lg hover:bg-[#e8c602] transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-[#aaaaaa] disabled:cursor-not-allowed font-['Inter',sans-serif]"
                  >
                    <i className={`${(validating || isLoadingFromUrl) ? 'ri-loader-4-line animate-spin' : 'ri-shield-check-line'}`}></i>
                    <span>
                      {validating ? "Validating..." : 
                       isLoadingFromUrl ? "Loading..." : 
                       "Validate Certificate"}
                    </span>
                  </button>
                  
                  {(certificateFile || validationResult || imagePreview) && (
                    <button
                      type="button"
                      onClick={resetValidation}
                      className="px-6 py-3 sm:block hidden cursor-pointer bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 font-['Inter',sans-serif]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 h-full">
              
              {!validationResult || isLoadingFromUrl ? (
                <ValidationPreview />
              ) : validationResult && (
                <div className="max-w-4xl mx-auto">
                  {validationResult.valid ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                          <i className="ri-shield-check-fill text-green-500 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-green-500 font-['Poppins',sans-serif]">Certificate Valid</h3>
                          <p className="text-sm text-[#c2c2c2] font-['DM_Sans',sans-serif]">This certificate is authentic and verified</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-[#c2c2c2] font-['Inter',sans-serif]">Certificate Title</label>
                            <p className="text-white font-medium font-['DM_Sans',sans-serif]">{validationResult.credential.title}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-[#c2c2c2] font-['Inter',sans-serif]">Issued To</label>
                            <p className="text-white font-['DM_Sans',sans-serif]">{validationResult.credential.studentName}</p>
                            <p className="text-sm text-[#c2c2c2] font-['Inter',sans-serif]">{validationResult.credential.studentEmail}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-[#c2c2c2] font-['Inter',sans-serif]">Issued By</label>
                            <p className="text-white font-['DM_Sans',sans-serif]">{validationResult.credential.universityName}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-[#c2c2c2] font-['Inter',sans-serif]">Issue Date</label>
                            <p className="text-white font-['DM_Sans',sans-serif]">{new Date(validationResult.credential.issueDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-[#c2c2c2] font-['Inter',sans-serif]">Certificate Hash</label>
                            <p className="text-xs text-gray-300 font-mono break-all bg-white/5 p-2 rounded">
                              {validationResult.credential.hash}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-[#c2c2c2] font-['Inter',sans-serif]">Blockchain Status</label>
                            <div className="bg-white/5 p-3 rounded space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Verification:</span>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${validationResult.credential.blockchainVerified ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                  <span className="text-sm text-gray-300">
                                    {validationResult.credential.blockchainVerified ? 'Blockchain' : 
                                     validationResult.credential.blockchainStatus === 'no_blockchain_record' ? 'Legacy' : 'Not Verified'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#c2c2c2]">Network:</span>
                                <span className="text-sm text-gray-300">
                                  {validationResult.credential.blockchainTxHash ? 'Polygon Amoy' : 'N/A'}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#c2c2c2]">Txn:</span>
                                {validationResult.credential.blockchainTxHash ? (
                                  <button
                                    onClick={() => window.open(`https://amoy.polygonscan.com/tx/${validationResult.credential.blockchainTxHash}`, '_blank')}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                                  >
                                    <span className="font-mono">{validationResult.credential.blockchainTxHash.slice(0, 8)}...{validationResult.credential.blockchainTxHash.slice(-6)}</span>
                                    <i className="ri-external-link-line text-xs"></i>
                                  </button>
                                ) : (
                                  <span className="text-sm text-gray-500">N/A</span>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-[#c2c2c2]">Verification ID:</span>
                                <span className="text-sm font-mono text-gray-300">{validationResult.credential.slug}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <i className="ri-shield-check-line text-green-500"></i>
                            <h4 className="text-sm font-semibold text-green-500 font-['DM_Sans',sans-serif]">Verification Complete</h4>
                          </div>
                          <p className="text-xs text-[#c2c2c2] font-['Inter',sans-serif]">
                            This certificate has been cryptographically verified and matches our secure database records.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                          <i className="ri-shield-cross-fill text-red-500 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-500 font-['Poppins',sans-serif]">Certificate Invalid</h3>
                          <p className="text-sm text-[#c2c2c2] font-['DM_Sans',sans-serif]">This certificate could not be verified</p>
                        </div>
                      </div>
                      
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <p className="text-red-400 text-sm font-['DM_Sans',sans-serif]">
                          {validationResult.message || "No matching certificate found in our database"}
                        </p>
                        {validationResult.searchSlug && (
                          <p className="text-[#c2c2c2] text-xs mt-2 font-['Inter',sans-serif]">
                            Searched for credential ID: <span className="font-mono">{validationResult.searchSlug}</span>
                          </p>
                        )}
                      </div>
                      
                      <div className="text-sm text-[#c2c2c2] space-y-2 font-['Inter',sans-serif]">
                        <p>This could mean:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>The certificate was not issued through our system</li>
                          <li>The file has been modified since issuance</li>
                          <li>This is not an official academic credential</li>
                        </ul>
                      </div>

                      {/* Additional Help for Invalid Certificates */}
                      <div className="mt-6 space-y-4">
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <i className="ri-information-line text-yellow-500 text-sm"></i>
                            <h4 className="text-sm font-semibold text-yellow-500 font-['DM_Sans',sans-serif]">What to do next?</h4>
                          </div>
                          <ul className="text-xs text-[#c2c2c2] space-y-1 font-['Inter',sans-serif]">
                            <li>• Contact the issuing institution directly</li>
                            <li>• Try scanning the QR code on the certificate instead</li>
                            <li>• Verify you have the original, unmodified file</li>
                            <li>• Check if the certificate was issued through Proofly</li>
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8 font-['Poppins',sans-serif]">How Validation Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#fbda02]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-upload-2-line text-[#fbda02] text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Upload Certificate</h3>
              <p className="text-[#c2c2c2] text-sm max-w-[19rem] mx-auto font-['Inter',sans-serif] leading-relaxed">
                Upload the digital certificate image you want to verify
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#fbda02]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-fingerprint-line text-[#fbda02] text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Generate Hash</h3>
              <p className="text-[#c2c2c2] text-sm max-w-[19rem] mx-auto font-['Inter',sans-serif] leading-relaxed">
                We create a unique SHA-256 cryptographic fingerprint of your file
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#fbda02]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-database-2-line text-[#fbda02] text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Verify Against Database</h3>
              <p className="text-[#c2c2c2] text-sm max-w-[19rem] mx-auto font-['Inter',sans-serif] leading-relaxed">
                We compare the hash against our secure blockchain database
              </p>
            </div>
          </div>
        </div>

        {/* Security Features Section - Hidden on small screens */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Poppins',sans-serif]">Why Trust Proofly?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-green-500 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Blockchain Secured</h3>
              <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                All certificates are secured with immutable blockchain technology
              </p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-blue-500 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Instant Verification</h3>
              <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                Get validation results in seconds, not days
              </p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-global-line text-purple-500 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Global Recognition</h3>
              <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                Accepted by employers and institutions worldwide
              </p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-lock-line text-orange-500 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2 font-['DM_Sans',sans-serif]">Privacy First</h3>
              <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                Your documents are processed securely and never stored
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats Section - Hidden on small screens */}
        <div className="mt-20 hidden md:block">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-8 font-['Poppins',sans-serif]">Supported Certificate Types</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-graduation-cap-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Academic Degrees</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-medal-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Professional Certificates</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-award-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Course Completions</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-file-text-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Training Records</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-briefcase-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Work Experience</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-star-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Achievements</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-bookmark-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Licenses</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white/[0.03] rounded-lg border border-white/10">
                <i className="ri-calendar-check-line text-[#fbda02] text-xl"></i>
                <span className="text-sm font-['DM_Sans',sans-serif]">Event Attendance</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section - Hidden on small screens */}
        <div className="mt-20 hidden lg:block">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Poppins',sans-serif]">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 font-['DM_Sans',sans-serif]">How secure is the validation process?</h3>
                <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                  Our validation uses military-grade SHA-256 cryptographic hashing combined with blockchain verification. 
                  Your documents are processed locally and never permanently stored on our servers.
                </p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 font-['DM_Sans',sans-serif]">What file formats are supported?</h3>
                <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                  We support PNG, JPG, JPEG, WebP, and PDF files. For best results, ensure your certificate 
                  image is clear and high-resolution.
                </p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 font-['DM_Sans',sans-serif]">How long does validation take?</h3>
                <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                  Most validations complete within 2-3 seconds. The process involves a cryptographic 
                  hash and checking it against our blockchain database.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 font-['DM_Sans',sans-serif]">What if my certificate isn't found?</h3>
                <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                  If your certificate isn't found, it may not have been issued through our platform, 
                  or the file may have been modified. Contact the issuing institution for verification.
                </p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 font-['DM_Sans',sans-serif]">Is there a cost for validation?</h3>
                <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                  Basic certificate validation is completely free. We believe in making credential 
                  verification accessible to everyone in the digital age.
                </p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 font-['DM_Sans',sans-serif]">Can I validate multiple certificates?</h3>
                <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif] leading-relaxed">
                  Yes, you can validate as many certificates as needed. Each validation is processed 
                  independently with the same level of security and accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-[#c2c2c2] text-sm font-['Inter',sans-serif]">
              © 2024 Proofly. Secured by blockchain technology.
            </p>
            
            <div className="flex items-center space-x-4">
              <button className="text-[#c2c2c2] hover:text-white transition duration-300">
                <i className="ri-question-line"></i>
              </button>
              
              <button className="text-[#c2c2c2] hover:text-white transition duration-300">
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

// Main component wrapped in Suspense
const ValidatePageWithSuspense = () => {
  return (
    <Suspense fallback={<ValidatePageLoading />}>
      <ValidatePage />
    </Suspense>
  );
};

export default ValidatePageWithSuspense; 