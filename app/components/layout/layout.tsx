import Link from 'next/link';
import styles from './Layout.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.container}>
        <div className={styles.sidebar}>
            <ul>
            <li>
                <Link href="/">Dashboard</Link>
            </li>
            <li>
                <Link href="/backlog">Backlog</Link>
            </li>
            </ul>
        </div>
        <div className={styles.content}>
            {children}
        </div>
        </div>
    );
}