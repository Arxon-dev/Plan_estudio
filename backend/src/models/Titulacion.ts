import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface TitulacionAttributes {
    id: number;
    userId: number;
    nivel: string;
    puntos: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface TitulacionCreationAttributes extends Optional<TitulacionAttributes, 'id'> { }

class Titulacion extends Model<TitulacionAttributes, TitulacionCreationAttributes> implements TitulacionAttributes {
    public id!: number;
    public userId!: number;
    public nivel!: string;
    public puntos!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Titulacion.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            unique: true,
        },
        nivel: {
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
        tableName: 'titulaciones',
        timestamps: true,
    }
);

Titulacion.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Titulacion, { foreignKey: 'userId', as: 'titulacion' });

export default Titulacion;
