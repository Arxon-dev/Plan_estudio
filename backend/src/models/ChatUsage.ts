import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class ChatUsage extends Model {
    public id!: number;
    public userId!: number;
    public month!: string;
    public queriesCount!: number;
    public lastQueryAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

ChatUsage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
        },
        month: {
            type: DataTypes.STRING(7),
            allowNull: false,
        },
        queriesCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'queries_count',
        },
        lastQueryAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'last_query_at',
        },
    },
    {
        sequelize,
        tableName: 'chat_usage',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'month'],
            },
        ],
    }
);

// Definir relación
ChatUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ChatUsage, { foreignKey: 'userId', as: 'chatUsages' });

export default ChatUsage;
