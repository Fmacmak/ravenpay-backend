import { Application, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db";

export class AuthenticationService {
    public static async registerRoutes(app: Application) {
        app.post('/login', AuthenticationService.login);
        app.post('/signup', AuthenticationService.signup);
    }

    public static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await db('users').where({ email }).first();
            if (!user) {
                return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.status(200).json({
                status: 'ok',
                message: `kyc ${user.kyc_status}`,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    kycStatus: user.kyc_status
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
    
    public static async signup(req: Request, res: Response) {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await db('users').where({ email }).first();
            if (existingUser) {
                return res.status(400).json({ status: 'error', message: 'Email already registered' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const [userId] = await db('users').insert({
                email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                kyc_status: 'pending'
            });

            res.status(201).json({
                status: 'ok',
                message: 'kyc pending',
                user: {
                    id: userId,
                    email,
                    firstName,
                    lastName,
                    kycStatus: 'pending'
                }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error' });
        }
    }
}