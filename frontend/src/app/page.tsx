'use client';

import { Document } from './document';
import DocumentCard from './documentCard';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DndProvider, } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import config from './config.json';

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [originalDocuments, setOriginalDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/documents/`)
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setOriginalDocuments(data);
      });
  }, []);

    const moveCard = (fromIndex: number, toIndex: number) => {
    const updatedDocuments = [...documents];
    const [movedCard] = updatedDocuments.splice(fromIndex, 1);

    // Update the moved card's position
    movedCard.position = toIndex; // Set new position based on the target index
    updatedDocuments.splice(toIndex, 0, movedCard);

    // Update positions of other documents
    updatedDocuments.forEach((doc, index) => {
      doc.position = index;
    });

    setDocuments(updatedDocuments);
  };

  const handleCardClick = (document: Document) => {
    setOverlayImage(`/images/${document.type}.png`);
  };

  const handleOverlayClose = () => {
    setOverlayImage(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOverlayClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save changes to the API every 5 seconds
  useEffect(() => {
    const saveDocuments = async () => {
      // Create a list of changed documents
      const changedDocuments = documents.filter((doc: Document, index: Number) => {
        const originalDoc = originalDocuments[index];
        return (
          doc.type !== originalDoc.type &&
          doc.title !== originalDoc.title &&
          doc.position !== originalDoc.position
        );
      });

      const documentsToUpdate = changedDocuments.map((doc: Document) => ({
        id: doc.id,
        type: doc.type,
        title: doc.title,
        position: doc.position,
      }));

      if (documentsToUpdate.length > 0) {
        setIsSaving(true);
        try {
          // Send a batch update request to the backend with only changed documents
          await fetch(`${config.apiBaseUrl}/documents/batch-update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(documentsToUpdate), // Send only changed documents
          });
          setOriginalDocuments([...documents]); // Update the original documents
          setLastSavedTime(new Date()); // Update the last saved time
        } catch (error) {
          console.error("Error saving documents:", error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    const intervalId = setInterval(saveDocuments, config.saveInterval);
    return () => clearInterval(intervalId);
  }, [documents, originalDocuments]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <DndProvider backend={HTML5Backend}>
          <div className="container mx-auto p-5">
            <div className="grid grid-cols-3 gap-5">
              {documents.map((document, index) => (
                <div key={document.type} onClick={() => handleCardClick(document)}>
                  <DocumentCard document={document} index={index} moveCard={moveCard} />
                </div>
              ))}
            </div>
            {overlayImage && (
              <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 flex justify-center items-center" onClick={handleOverlayClose}>
                <Image src={overlayImage} alt="Overlay" width={500} height={400} className="rounded-lg" />
              </div>
            )}
            {/* Display loading spinner and last saved time */}
            {isSaving && (
              <div className="fixed bottom-0 right-0 m-4 p-2 bg-white rounded shadow-lg">
                <p>Saving...</p>
              </div>
            )}
            {lastSavedTime && !isSaving && (
              <div className="fixed bottom-0 right-0 m-4 p-2 bg-white rounded shadow-lg">
                <p>Last saved: {lastSavedTime.toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </DndProvider>
      </main>
    </div>
  );
}
