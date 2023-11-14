import React, {useState, useEffect} from 'react';
import {Form, Input, Button, Card, notification, Image} from 'antd';
import TelegramLoginButton, {TelegramUser} from './TelegramLogin'
import {useNavigate} from 'react-router-dom';

const server_address: string = 'http://localhost:8000'
const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const [captcha, setCaptcha] = useState({image: '', id: ''});
    useEffect(() => {
        fetchCaptcha();
    }, []);
    const TelegramResponse = async (user: TelegramUser) => {
        const telegramId = user.id;
        try {
            const response = await fetch(server_address + '/api/telegram_login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id: telegramId}),
            });
            if (!response.ok) {
                throw new Error();
            }
            const data = await response.json();
            notification.success({
                message: 'Успешный вход(ТГ)',
                description: 'Вход успешен'
            });
            navigate(`/clientarea`, data.token);
            //передаю токен на личный кабинет через роутер
            return true;
        } catch (error) {
            notification.error({
                message: 'Логин неуспешен(ТГ)',
                description: 'Проверь данные'
            });
            return false;
        }
    };
    const fetchCaptcha = async () => {
        //заберем капчу с бэка
        try {
            const response = await fetch(server_address + '/api/captcha/');
            const data = await response.json();
            setCaptcha({image: data.image, id: data.captcha_id});
        } catch (error) {
            notification.error({
                message: 'Ошибка в капче',
                description: 'Капча не загрузилась'
            });
        }
    };
    const verifyCaptcha = async (captchaResponse: string) => {
        //проверим что ввел юзер
        try {
            const response = await fetch(server_address + '/api/verify_captcha/',
                {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({captcha_id: captcha.id, captcha: captchaResponse})
                });

            if (!response.ok) {
                throw new Error();
            }

            return true;
        } catch (error) {
            notification.error({
                message: 'Неверно введена капча',
                description: 'Проверьте данные в капче'
            });
            return false;
        }
    };

    const ValidCheck = async (values: any) => {
        const isCaptchaValid = await verifyCaptcha(values.captcha);
        if (isCaptchaValid) {
            //сначала проверяем капчу а потом проверяем логин+пасс
            try {
                const loginResponse = await fetch(server_address + '/api/login/',
                    {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username: values.username, password: values.password})
                    });
                if (!loginResponse.ok) {
                    throw new Error();
                }
                const data = await loginResponse.json();
                notification.success({
                    message: 'Успешный вход',
                    description: 'Авторизация успешна'
                });
                navigate(`/clientarea`, {state: {token: data.token}});
            } catch (error) {
                notification.error({
                    message: 'Неверные данные для входа',
                    description: 'Авторизация не успешна'
                });
            }
        } else {
            fetchCaptcha();
        }
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
            <Card style={{width: 300}}>
                <Form
                    name="LoginForm"
                    onFinish={ValidCheck}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[{required: true, message: 'Please input your Username!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[{required: true, message: 'Please input your password!'}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item>
                        <Image
                            width={200}
                            src={`data:image/png;base64,${captcha.image}`}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="dashed" htmlType="button"
                                onClick={fetchCaptcha}>
                            Refresh
                        </Button>
                    </Form.Item>
                    <Form.Item
                        name="captcha"
                        label="Captcha"
                        rules={[{required: true, message: 'Please input the captcha!'}]}
                    >
                        <Input className="input"/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Login
                        </Button>
                    </Form.Item>
                    <div>
                        <TelegramLoginButton dataOnAuth={TelegramResponse} botName="lmsitmobot"/>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginForm;
