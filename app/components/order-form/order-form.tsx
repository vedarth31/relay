
import { useState } from 'react'
import styles from './order-form.module.css'

interface MethodProps {
    onButtonClick: () => void;
    onClose: () => void;
}

function Method({onButtonClick, onClose} : MethodProps){
    return <div className={styles.formBG}>
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>Order Form</h1>

                <button className={styles.closeButton} onClick={onClose}>X</button>
            </div>

            <h1 className={styles.formParagraph}>How do you want to create this order?</h1>

            <button className={styles.nextButton} onClick={onButtonClick}>Next step</button>
        </div>
    </div>
}

function Upload({ onSubmit, onClose }: { onSubmit: (file: File) => void, onClose: () => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
        setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
        onSubmit(selectedFile);
        } else {
        alert('Please select a CSV file to upload.');
        }
    };

    return (
        <div className={styles.formBG}>
            <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>Order Form</h1>
                <button className={styles.closeButton} onClick={onClose}>X</button>
            </div>
            <h1 className={styles.formParagraph}>Upload your CSV</h1>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <button className={styles.nextButton} onClick={handleUpload}>
                Upload
            </button>
            </div>
        </div>
        );
    }

export default function OrderForm({onClose} : {onClose: () => void}){
    const [currentScreen, setCurrentScreen] = useState(0)

    const handleNextClick = () => {
        setCurrentScreen((prevScreen) => prevScreen + 1);
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('/api/orders/upload', {
                method: 'POST',
                body: formData,
            });
        
            if (response.ok) {
                alert('Order created successfully!');
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error}`);
            }
            } catch (error) {
                console.error('Upload error:', error);
                alert('An error occurred while uploading the file.');
            }
    };

    const screens  = [<Method key='method' onButtonClick={handleNextClick} onClose={onClose}/>, <Upload key='upload' onSubmit={handleFileUpload} onClose={onClose}/>]

    return screens[currentScreen]
}