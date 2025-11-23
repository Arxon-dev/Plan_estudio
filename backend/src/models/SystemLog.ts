import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface SystemLogAttributes {
    id: number;
    adminId?: number;
    adminName?: string;
    action: string;
    resource: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface SystemLogCreationAttributes extends Optional<SystemLogAttributes, 'id'> { }

class SystemLog extends Model<SystemLogAttributes, SystemLogCreationAttributes> implements SystemLogAttributes {
    public id!: number;
    public adminId?: number;
    public adminName?: string;
    public action!: string;
    public resource!: string;
    public details?: any;
    public ipAddress?: string;
    public userAgent?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

SystemLog.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        adminId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        adminName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        resource: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'system_logs',
        timestamps: true,
        updatedAt: false, // Logs usually don't change
    }
);

// Relación (opcional, si queremos hacer include)
SystemLog.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

export default SystemLog;
