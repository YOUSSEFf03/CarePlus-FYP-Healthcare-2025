import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';
import CustomInput from '../components/Inputs/CustomInput';
import CustomText from '../components/Text/CustomText';
import Button from '../components/Button/Button';
import doctorSlide from '../assets/images/doctor-login-img.jpg';
import assistantSlide from '../assets/images/assistant-login-img.jpg';
import pharmacySlide from '../assets/images/pharmacy-login-img.jpg';
import { ReactComponent as ArrowUpRightIcon } from '../assets/svgs/ArrowUpRight.svg';

const DEMO_PHARMACY = {
    email: 'pharmacy@demo.com',
    password: 'pharmacy123',
    name: 'City Care Pharmacy',
};

const DEMO_DOCTOR = {
    email: 'doctor@demo.com',
    password: 'doctor123',
    name: 'John Doe',
};

const DEMO_ASSISTANT = {
    email: 'assistant@demo.com',
    password: 'assistant123',
    name: 'Alice Smith',
};

type Role = 'doctor' | 'assistant' | 'pharmacy';

type JwtPayload = {
    sub: string;
    email: string;
    name: string;
    role: Role;
    exp: number;
};

function decodeJwt(token: string): JwtPayload {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (
            email.trim().toLowerCase() === DEMO_PHARMACY.email &&
            password === DEMO_PHARMACY.password
        ) {
            // set whatever your app expects
            const role: Role = 'pharmacy';
            localStorage.setItem('token', 'demo-token');      // optional, if other pages check it
            localStorage.setItem('userName', DEMO_PHARMACY.name);
            localStorage.setItem('userRole', role);

            login({ name: DEMO_PHARMACY.name, role });        // from your AuthContext
            navigate('/pharmacy');
            setLoading(false);
            return;
        } else if (
            email.trim().toLowerCase() === DEMO_DOCTOR.email &&
            password === DEMO_DOCTOR.password
        ) {
            // set whatever your app expects
            const role: Role = 'doctor';
            localStorage.setItem('token', 'demo-token');      // optional, if other pages check it
            localStorage.setItem('userName', DEMO_DOCTOR.name);
            localStorage.setItem('userRole', role);

            login({ name: DEMO_DOCTOR.name, role });        // from your AuthContext
            navigate('/doctor');
            setLoading(false);
            return;
        } else if (
            email.trim().toLowerCase() === DEMO_ASSISTANT.email &&
            password === DEMO_ASSISTANT.password
        ) {
            // set whatever your app expects
            const role: Role = 'assistant';
            localStorage.setItem('token', 'demo-token');
            localStorage.setItem('userName', DEMO_ASSISTANT.name);
            localStorage.setItem('userRole', role);

            login({ name: DEMO_ASSISTANT.name, role });
            navigate('/assistant');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email,
                password,
            });

            console.log('Login API response:', response.data);

            const token = response.data?.data?.access_token || response.data?.access_token;
            if (!token) throw new Error('No access token received');

            const decoded: JwtPayload = decodeJwt(token);
            console.log("Decoded JWT:", decoded);
            localStorage.setItem('token', token);
            localStorage.setItem('userName', decoded.name);
            localStorage.setItem('userRole', decoded.role);
            login({ name: decoded.name, role: decoded.role });
            navigate(`/${decoded.role}`);
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const slides = [
        {
            image: doctorSlide,
            link: "Learn More",
            role: "CarePlus - Doctor",
            description: "Access patient records, write prescriptions, and manage appointments effortlessly.",
        },
        {
            image: assistantSlide,
            link: "Learn More",
            role: "CarePlus - Assistant",
            description: "Assist doctors by managing calendars and coordinating patient visits efficiently.",
        },
        {
            image: pharmacySlide,
            link: "Learn More",
            role: "CarePlus - Pharmacy",
            description: "Sell medications online, verify digital prescriptions, and track inventory in real-time.",
        },
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-slide logic
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="login-page">
            <div className='login-slider'>
                <div className="login-brand-logo">
                    <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M212.293 99.9024C212.293 93.0056 206.697 87.3763 199.812 87.7817C162.21 89.9959 125.792 102.183 94.3493 123.192C59.4379 146.519 32.2278 179.675 16.1599 218.466C0.0919844 257.258 -4.11212 299.943 4.07924 341.124C12.2706 382.304 32.4895 420.131 62.1792 449.821C91.8688 479.511 129.696 499.729 170.876 507.921C212.057 516.112 254.742 511.908 293.534 495.84C332.325 479.772 365.481 452.562 388.808 417.651C409.817 386.208 422.004 349.79 424.218 312.188C424.624 305.303 418.994 299.707 412.098 299.707H346.876C339.979 299.707 334.455 305.313 333.75 312.174C331.724 331.916 324.907 350.934 313.812 367.54C300.396 387.619 281.327 403.268 259.017 412.509C236.707 421.75 212.157 424.168 188.473 419.457C164.789 414.746 143.033 403.117 125.958 386.042C108.883 368.967 97.2542 347.211 92.5431 323.527C87.832 299.843 90.2499 275.293 99.491 252.983C108.732 230.673 124.381 211.604 144.46 198.188C161.066 187.093 180.084 180.276 199.826 178.25C206.687 177.545 212.293 172.021 212.293 165.124V99.9024Z" fill="#050F2A" />
                        <path d="M249.756 99.9024C249.756 93.0056 255.347 87.4146 262.244 87.4146H324.683C331.58 87.4146 337.171 93.0056 337.171 99.9024V162.341C337.171 169.238 331.58 174.829 324.683 174.829H262.244C255.347 174.829 249.756 169.238 249.756 162.341V99.9024Z" fill="#050F2A" />
                        <path d="M337.171 12.4878C337.171 5.59098 342.762 0 349.659 0H412.098C418.994 0 424.585 5.59098 424.585 12.4878V74.9268C424.585 81.8236 418.994 87.4146 412.098 87.4146H349.659C342.762 87.4146 337.171 81.8236 337.171 74.9268V12.4878Z" fill="#050F2A" />
                        <path d="M424.585 99.9024C424.585 93.0056 430.176 87.4146 437.073 87.4146H499.512C506.409 87.4146 512 93.0056 512 99.9024V162.341C512 169.238 506.409 174.829 499.512 174.829H437.073C430.176 174.829 424.585 169.238 424.585 162.341V99.9024Z" fill="#050F2A" />
                        <path d="M337.171 187.317C337.171 180.42 342.762 174.829 349.659 174.829H412.098C418.994 174.829 424.585 180.42 424.585 187.317V249.756C424.585 256.653 418.994 262.244 412.098 262.244H349.659C342.762 262.244 337.171 256.653 337.171 249.756V187.317Z" fill="#050F2A" />
                    </svg>
                </div>
                <div
                    className="slider-track"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div className="slide" key={index}>
                            <img src={slide.image} alt={slide.role} className="slide-image-full" />
                            <div className="slide-overlay">
                                <Link to={'/'} className='slide-link'>
                                    <CustomText variant='text-body-sm-r' as={'p'}>{slide.link}</CustomText>
                                    <ArrowUpRightIcon className='slide-link-icon' />
                                </Link>
                                <CustomText variant='text-body-lg-r' as={'p'}>{slide.description}</CustomText>
                                <CustomText variant='text-body-md-r' as={'p'}>{slide.role}</CustomText>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="slider-indicator">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`slider-bar ${index === currentSlide ? 'active' : ''}`}
                            style={{
                                animationPlayState: index === currentSlide ? 'running' : 'paused',
                            }}
                        />
                    ))}
                </div>
            </div>
            <div className='login-section'>
                <div className="login-header">
                    <div className="login-logo-n-back">
                        <Link to={'/'}>
                            <Button variant='tertiary'
                                iconLeft={
                                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.7073 25.2931C20.8002 25.386 20.8739 25.4963 20.9242 25.6177C20.9745 25.7391 21.0004 25.8692 21.0004 26.0006C21.0004 26.132 20.9745 26.2621 20.9242 26.3835C20.8739 26.5048 20.8002 26.6151 20.7073 26.7081C20.6144 26.801 20.5041 26.8747 20.3827 26.9249C20.2613 26.9752 20.1312 27.0011 19.9998 27.0011C19.8684 27.0011 19.7383 26.9752 19.6169 26.9249C19.4955 26.8747 19.3852 26.801 19.2923 26.7081L9.29231 16.7081C9.19933 16.6152 9.12557 16.5049 9.07525 16.3835C9.02493 16.2621 8.99902 16.132 8.99902 16.0006C8.99902 15.8691 9.02493 15.739 9.07525 15.6176C9.12557 15.4962 9.19933 15.3859 9.29231 15.2931L19.2923 5.29306C19.4799 5.10542 19.7344 5 19.9998 5C20.2652 5 20.5197 5.10542 20.7073 5.29306C20.895 5.4807 21.0004 5.73519 21.0004 6.00056C21.0004 6.26592 20.895 6.52042 20.7073 6.70806L11.4136 16.0006L20.7073 25.2931Z" fill="currentColor" />
                                    </svg>
                                }>
                            </Button>
                        </Link>
                        <svg className='logo-login' width="210" height="56" viewBox="0 0 210 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.2195 10.9268C23.2195 10.1725 22.6074 9.55679 21.8544 9.60113C17.7418 9.8433 13.7585 11.1763 10.3195 13.4742C6.50102 16.0256 3.52492 19.6519 1.76749 23.8948C0.0100608 28.1376 -0.449763 32.8062 0.446167 37.3104C1.3421 41.8145 3.55354 45.9518 6.80085 49.1992C10.0482 52.4465 14.1855 54.6579 18.6896 55.5538C23.1938 56.4498 27.8624 55.9899 32.1052 54.2325C36.3481 52.4751 39.9744 49.499 42.5258 45.6806C44.8238 42.2415 46.1567 38.2582 46.3989 34.1456C46.4432 33.3926 45.8275 32.7805 45.0732 32.7805H37.9396C37.1852 32.7805 36.581 33.3936 36.504 34.144C36.2823 36.3033 35.5367 38.3834 34.3231 40.1997C32.8558 42.3958 30.7701 44.1074 28.33 45.1182C25.8898 46.1289 23.2047 46.3934 20.6142 45.8781C18.0238 45.3628 15.6443 44.091 13.7767 42.2233C11.909 40.3557 10.6372 37.9762 10.1219 35.3858C9.60662 32.7953 9.87108 30.1102 10.8818 27.67C11.8926 25.2299 13.6042 23.1442 15.8003 21.6769C17.6166 20.4633 19.6967 19.7177 21.856 19.496C22.6064 19.419 23.2195 18.8148 23.2195 18.0604V10.9268Z" fill="#050F2A" />
                            <path d="M27.3171 10.9268C27.3171 10.1725 27.9286 9.56097 28.6829 9.56097H35.5122C36.2665 9.56097 36.8781 10.1725 36.8781 10.9268V17.7561C36.8781 18.5104 36.2665 19.1219 35.5122 19.1219H28.6829C27.9286 19.1219 27.3171 18.5104 27.3171 17.7561V10.9268Z" fill="#050F2A" />
                            <path d="M36.8781 1.36585C36.8781 0.611513 37.4896 0 38.2439 0H45.0732C45.8275 0 46.439 0.611513 46.439 1.36585V8.19512C46.439 8.94946 45.8275 9.56097 45.0732 9.56097H38.2439C37.4896 9.56097 36.8781 8.94946 36.8781 8.19512V1.36585Z" fill="#050F2A" />
                            <path d="M46.439 10.9268C46.439 10.1725 47.0505 9.56097 47.8049 9.56097H54.6341C55.3885 9.56097 56 10.1725 56 10.9268V17.7561C56 18.5104 55.3885 19.1219 54.6341 19.1219H47.8049C47.0505 19.1219 46.439 18.5104 46.439 17.7561V10.9268Z" fill="#050F2A" />
                            <path d="M36.8781 20.4878C36.8781 19.7335 37.4896 19.1219 38.2439 19.1219H45.0732C45.8275 19.1219 46.439 19.7335 46.439 20.4878V27.3171C46.439 28.0714 45.8275 28.6829 45.0732 28.6829H38.2439C37.4896 28.6829 36.8781 28.0714 36.8781 27.3171V20.4878Z" fill="#050F2A" />
                            <path d="M67.184 31.832C67.184 29.656 67.6853 27.704 68.688 25.976C69.712 24.248 71.088 22.904 72.816 21.944C74.5653 20.9627 76.4747 20.472 78.544 20.472C80.912 20.472 83.0133 21.0587 84.848 22.232C86.704 23.384 88.048 25.0267 88.88 27.16H84.496C83.92 25.9867 83.12 25.112 82.096 24.536C81.072 23.96 79.888 23.672 78.544 23.672C77.072 23.672 75.76 24.0027 74.608 24.664C73.456 25.3253 72.5493 26.2747 71.888 27.512C71.248 28.7493 70.928 30.1893 70.928 31.832C70.928 33.4747 71.248 34.9147 71.888 36.152C72.5493 37.3893 73.456 38.3493 74.608 39.032C75.76 39.6933 77.072 40.024 78.544 40.024C79.888 40.024 81.072 39.736 82.096 39.16C83.12 38.584 83.92 37.7093 84.496 36.536H88.88C88.048 38.6693 86.704 40.312 84.848 41.464C83.0133 42.616 80.912 43.192 78.544 43.192C76.4533 43.192 74.544 42.712 72.816 41.752C71.088 40.7707 69.712 39.416 68.688 37.688C67.6853 35.96 67.184 34.008 67.184 31.832ZM91.934 34.104C91.934 32.3333 92.2967 30.7653 93.022 29.4C93.7687 28.0347 94.7713 26.9787 96.03 26.232C97.31 25.464 98.718 25.08 100.254 25.08C101.641 25.08 102.846 25.3573 103.87 25.912C104.915 26.4453 105.747 27.1173 106.366 27.928V25.368H110.046V43H106.366V40.376C105.747 41.208 104.905 41.9013 103.838 42.456C102.771 43.0107 101.555 43.288 100.19 43.288C98.6753 43.288 97.2887 42.904 96.03 42.136C94.7713 41.3467 93.7687 40.2587 93.022 38.872C92.2967 37.464 91.934 35.8747 91.934 34.104ZM106.366 34.168C106.366 32.952 106.11 31.896 105.598 31C105.107 30.104 104.457 29.4213 103.646 28.952C102.835 28.4827 101.961 28.248 101.022 28.248C100.083 28.248 99.2087 28.4827 98.398 28.952C97.5873 29.4 96.926 30.072 96.414 30.968C95.9233 31.8427 95.678 32.888 95.678 34.104C95.678 35.32 95.9233 36.3867 96.414 37.304C96.926 38.2213 97.5873 38.9253 98.398 39.416C99.23 39.8853 100.105 40.12 101.022 40.12C101.961 40.12 102.835 39.8853 103.646 39.416C104.457 38.9467 105.107 38.264 105.598 37.368C106.11 36.4507 106.366 35.384 106.366 34.168ZM118.486 27.928C119.019 27.032 119.723 26.3387 120.598 25.848C121.494 25.336 122.55 25.08 123.766 25.08V28.856H122.838C121.408 28.856 120.32 29.2187 119.574 29.944C118.848 30.6693 118.486 31.928 118.486 33.72V43H114.838V25.368H118.486V27.928ZM143.279 33.752C143.279 34.4133 143.236 35.0107 143.151 35.544H129.679C129.785 36.952 130.308 38.0827 131.247 38.936C132.185 39.7893 133.337 40.216 134.703 40.216C136.665 40.216 138.052 39.3947 138.863 37.752H142.799C142.265 39.3733 141.295 40.7067 139.887 41.752C138.5 42.776 136.772 43.288 134.703 43.288C133.017 43.288 131.503 42.9147 130.159 42.168C128.836 41.4 127.791 40.3333 127.023 38.968C126.276 37.5813 125.903 35.9813 125.903 34.168C125.903 32.3547 126.265 30.7653 126.991 29.4C127.737 28.0133 128.772 26.9467 130.095 26.2C131.439 25.4533 132.975 25.08 134.703 25.08C136.367 25.08 137.849 25.4427 139.151 26.168C140.452 26.8933 141.465 27.9173 142.191 29.24C142.916 30.5413 143.279 32.0453 143.279 33.752ZM139.471 32.6C139.449 31.256 138.969 30.1787 138.031 29.368C137.092 28.5573 135.929 28.152 134.543 28.152C133.284 28.152 132.207 28.5573 131.311 29.368C130.415 30.1573 129.881 31.2347 129.711 32.6H139.471ZM162.421 27.384C162.421 28.5147 162.154 29.5813 161.621 30.584C161.087 31.5867 160.234 32.408 159.061 33.048C157.887 33.6667 156.383 33.976 154.549 33.976H150.517V43H146.869V20.76H154.549C156.255 20.76 157.695 21.0587 158.869 21.656C160.063 22.232 160.949 23.0213 161.525 24.024C162.122 25.0267 162.421 26.1467 162.421 27.384ZM154.549 31C155.935 31 156.97 30.6907 157.653 30.072C158.335 29.432 158.677 28.536 158.677 27.384C158.677 24.952 157.301 23.736 154.549 23.736H150.517V31H154.549ZM169.548 19.32V43H165.9V19.32H169.548ZM190.306 25.368V43H186.658V40.92C186.082 41.6453 185.324 42.2213 184.386 42.648C183.468 43.0533 182.487 43.256 181.442 43.256C180.055 43.256 178.807 42.968 177.698 42.392C176.61 41.816 175.746 40.9627 175.106 39.832C174.487 38.7013 174.178 37.336 174.178 35.736V25.368H177.794V35.192C177.794 36.7707 178.188 37.9867 178.978 38.84C179.767 39.672 180.844 40.088 182.21 40.088C183.575 40.088 184.652 39.672 185.442 38.84C186.252 37.9867 186.658 36.7707 186.658 35.192V25.368H190.306ZM201.519 43.288C200.132 43.288 198.884 43.0427 197.775 42.552C196.687 42.04 195.823 41.3573 195.183 40.504C194.543 39.6293 194.201 38.6587 194.159 37.592H197.935C197.999 38.3387 198.351 38.968 198.991 39.48C199.652 39.9707 200.473 40.216 201.455 40.216C202.479 40.216 203.268 40.024 203.823 39.64C204.399 39.2347 204.687 38.7227 204.687 38.104C204.687 37.4427 204.367 36.952 203.727 36.632C203.108 36.312 202.116 35.96 200.751 35.576C199.428 35.2133 198.351 34.8613 197.519 34.52C196.687 34.1787 195.961 33.656 195.343 32.952C194.745 32.248 194.447 31.32 194.447 30.168C194.447 29.2293 194.724 28.376 195.279 27.608C195.833 26.8187 196.623 26.2 197.647 25.752C198.692 25.304 199.887 25.08 201.231 25.08C203.236 25.08 204.847 25.592 206.063 26.616C207.3 27.6187 207.961 28.9947 208.047 30.744H204.399C204.335 29.9547 204.015 29.3253 203.439 28.856C202.863 28.3867 202.084 28.152 201.103 28.152C200.143 28.152 199.407 28.3333 198.895 28.696C198.383 29.0587 198.127 29.5387 198.127 30.136C198.127 30.6053 198.297 31 198.639 31.32C198.98 31.64 199.396 31.896 199.887 32.088C200.377 32.2587 201.103 32.4827 202.063 32.76C203.343 33.1013 204.388 33.4533 205.199 33.816C206.031 34.1573 206.745 34.6693 207.343 35.352C207.94 36.0347 208.249 36.9413 208.271 38.072C208.271 39.0747 207.993 39.9707 207.439 40.76C206.884 41.5493 206.095 42.168 205.071 42.616C204.068 43.064 202.884 43.288 201.519 43.288Z" fill="#050F2A" />
                        </svg>
                        <div></div>
                    </div>
                    <CustomText variant='text-heading-H1' as={'h1'}>Welcome Back!</CustomText>
                    <CustomText variant='text-body-lg-r' as={'p'}>Login to access your dashboard and start your journey!</CustomText>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <div className="">
                        <CustomInput
                            label="Email"
                            placeholder="you@example.com"
                            value={email}
                            leftIcon={
                                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M28 6.00049H4C3.73478 6.00049 3.48043 6.10585 3.29289 6.29338C3.10536 6.48092 3 6.73527 3 7.00049V24.0005C3 24.5309 3.21071 25.0396 3.58579 25.4147C3.96086 25.7898 4.46957 26.0005 5 26.0005H27C27.5304 26.0005 28.0391 25.7898 28.4142 25.4147C28.7893 25.0396 29 24.5309 29 24.0005V7.00049C29 6.73527 28.8946 6.48092 28.7071 6.29338C28.5196 6.10585 28.2652 6.00049 28 6.00049ZM25.4287 8.00049L16 16.6442L6.57125 8.00049H25.4287ZM27 24.0005H5V9.27424L15.3237 18.738C15.5082 18.9073 15.7496 19.0013 16 19.0013C16.2504 19.0013 16.4918 18.9073 16.6763 18.738L27 9.27424V24.0005Z" fill="currentColor" />
                                </svg>
                            }
                            onChange={(e) => setEmail(e.target.value)}
                            variant={error ? 'error' : 'normal'}
                            message={error && 'Invalid email or password'}
                        />
                    </div>

                    <div className="">
                        <CustomInput
                            type='password'
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            leftIcon={
                                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M27.0713 4.92923C25.4829 3.33861 23.4049 2.32957 21.1726 2.06492C18.9403 1.80027 16.684 2.29546 14.7677 3.47057C12.8514 4.64569 11.3869 6.43218 10.6106 8.54178C9.83424 10.6514 9.79133 12.961 10.4888 15.098L3.58626 22.0005C3.39973 22.1855 3.25185 22.4058 3.15121 22.6485C3.05057 22.8912 2.99917 23.1515 3.00001 23.4142V27.0005C3.00001 27.5309 3.21072 28.0396 3.5858 28.4147C3.96087 28.7898 4.46958 29.0005 5.00001 29.0005H9.00001C9.26523 29.0005 9.51958 28.8951 9.70712 28.7076C9.89465 28.52 10 28.2657 10 28.0005V26.0005H12C12.2652 26.0005 12.5196 25.8951 12.7071 25.7076C12.8947 25.52 13 25.2657 13 25.0005V23.0005H15C15.1314 23.0006 15.2615 22.9748 15.3829 22.9246C15.5043 22.8744 15.6146 22.8008 15.7075 22.708L16.9025 21.5117C17.9028 21.8371 18.9482 22.002 20 22.0005H20.0125C21.9893 21.9981 23.9211 21.4098 25.5637 20.3101C27.2063 19.2103 28.4862 17.6484 29.2415 15.8216C29.9969 13.9948 30.1939 11.9851 29.8076 10.0464C29.4213 8.10772 28.4691 6.327 27.0713 4.92923ZM28 12.263C27.8638 16.5242 24.2813 19.9955 20.0138 20.0005H20C18.9877 20.0022 17.9844 19.8109 17.0438 19.4367C16.8598 19.3569 16.656 19.3342 16.4589 19.3716C16.2619 19.4091 16.0806 19.5049 15.9388 19.6467L14.5863 21.0005H12C11.7348 21.0005 11.4804 21.1058 11.2929 21.2934C11.1054 21.4809 11 21.7353 11 22.0005V24.0005H9.00001C8.73479 24.0005 8.48044 24.1058 8.2929 24.2934C8.10537 24.4809 8.00001 24.7353 8.00001 25.0005V27.0005H5.00001V23.4142L12.3538 16.0617C12.4955 15.9198 12.5914 15.7386 12.6288 15.5416C12.6663 15.3445 12.6436 15.1407 12.5638 14.9567C12.1884 14.013 11.9971 13.0061 12 11.9905C12 7.72298 15.4763 4.14048 19.7375 4.00423C20.8321 3.9677 21.9225 4.15631 22.9413 4.55837C23.96 4.96044 24.8853 5.56739 25.6599 6.34164C26.4345 7.11589 27.0419 8.04093 27.4444 9.05948C27.8469 10.078 28.036 11.1684 28 12.263ZM24 9.50048C24 9.79715 23.912 10.0872 23.7472 10.3338C23.5824 10.5805 23.3481 10.7728 23.074 10.8863C22.7999 10.9998 22.4983 11.0295 22.2074 10.9717C21.9164 10.9138 21.6491 10.7709 21.4394 10.5611C21.2296 10.3514 21.0867 10.0841 21.0288 9.79311C20.971 9.50214 21.0007 9.20054 21.1142 8.92645C21.2277 8.65236 21.42 8.41809 21.6667 8.25327C21.9133 8.08845 22.2033 8.00048 22.5 8.00048C22.8978 8.00048 23.2794 8.15851 23.5607 8.43982C23.842 8.72112 24 9.10265 24 9.50048Z" fill="currentColor" />
                                </svg>
                            }
                            onChange={(e) => setPassword(e.target.value)}
                            variant={error ? 'error' : 'normal'}
                            message={error && 'Invalid email or password'}
                        />
                    </div>

                    <Button
                        type="submit"
                        text={loading ? 'Logging in...' : 'Login'}
                        disabled={loading}
                        variant="primary"
                    />
                </form>
            </div>
        </div >
    );
}

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// export default function Login() {
//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const [username, setUsername] = useState('');
//     const [role, setRole] = useState('doctor'); // default selected role

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         // Simulate login by role
//         login(role as 'doctor' | 'assistant' | 'pharmacy');

//         // Redirect to the appropriate dashboard
//         navigate(`/${role}`);
//     };

//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//             <h1 className="text-4xl font-bold mb-4">Login</h1>
//             <form className="w-full max-w-sm" onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
//                         Username
//                     </label>
//                     <input
//                         type="text"
//                         id="username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                         placeholder="Username"
//                     />
//                 </div>

//                 <div className="mb-6">
//                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
//                         Select Role
//                     </label>
//                     <select
//                         id="role"
//                         value={role}
//                         onChange={(e) => setRole(e.target.value)}
//                         className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
//                     >
//                         <option value="doctor">Doctor</option>
//                         <option value="assistant">Assistant</option>
//                         <option value="pharmacy">Pharmacy</option>
//                     </select>
//                 </div>

//                 <button
//                     type="submit"
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
//                 >
//                     Login
//                 </button>
//             </form>
//         </div>
//     );
// }