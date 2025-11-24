import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface RecompensaAttributes {
    id: number;
    userId: number;
    tipo: string;
    puntos: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface RecompensaCreationAttributes extends Optional<RecompensaAttributes, 'id'> { }

class Recompensa extends Model<RecompensaAttributes, RecompensaCreationAttributes> implements RecompensaAttributes {
    public id!: number;
    public userId!: number;
    public tipo!: string;
    public puntos!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Recompensa.init(
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
        tipo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        puntos: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'recompensas',
        timestamps: true,
    }
);

Recompensa.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Recompensa, { foreignKey: 'userId', as: 'recompensas' });

export default Recompensa;
