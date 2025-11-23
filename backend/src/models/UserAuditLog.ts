import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface UserAuditLogAttributes {
    id: number;
    userId: number;
    action: string;
    changedBy: number;
    details: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserAuditLogCreationAttributes extends Optional<UserAuditLogAttributes, 'id'> { }

class UserAuditLog extends Model<UserAuditLogAttributes, UserAuditLogCreationAttributes> implements UserAuditLogAttributes {
    public id!: number;
    public userId!: number;
    public action!: string;
    public changedBy!: number;
    public details!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

UserAuditLog.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        changedBy: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'user_audit_logs',
        timestamps: true,
    }
);

// Definir relaciones
UserAuditLog.belongsTo(User, { foreignKey: 'userId', as: 'targetUser' });
UserAuditLog.belongsTo(User, { foreignKey: 'changedBy', as: 'editor' });

export default UserAuditLog;
