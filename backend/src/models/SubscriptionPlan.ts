import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

interface SubscriptionPlanAttributes {
    id: number;
    name: string;
    price: number;
    currency: string;
    interval: string; // 'month', 'year', 'one_time'
    features: string[]; // Array of strings stored as JSON
    isFeatured: boolean;
    isActive: boolean;
    order: number;
    stripePriceId?: string;
    buttonText?: string;
    buttonLink?: string; // Optional custom link
    createdAt?: Date;
    updatedAt?: Date;
}

interface SubscriptionPlanCreationAttributes extends Optional<SubscriptionPlanAttributes, 'id'> { }

class SubscriptionPlan extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes> implements SubscriptionPlanAttributes {
    public id!: number;
    public name!: string;
    public price!: number;
    public currency!: string;
    public interval!: string;
    public features!: string[];
    public isFeatured!: boolean;
    public isActive!: boolean;
    public order!: number;
    public stripePriceId?: string;
    public buttonText?: string;
    public buttonLink?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SubscriptionPlan.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'EUR',
        },
        interval: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'month',
        },
        features: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        stripePriceId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        buttonText: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        buttonLink: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'subscription_plans',
        timestamps: true,
    }
);

export default SubscriptionPlan;
