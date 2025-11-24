import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface IdiomaAttributes {
    id: number;
    userId: number;
    idioma: string;
    nivel: string;
    puntos: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IdiomaCreationAttributes extends Optional<IdiomaAttributes, 'id'> { }

class Idioma extends Model<IdiomaAttributes, IdiomaCreationAttributes> implements IdiomaAttributes {
    public id!: number;
    public userId!: number;
    public idioma!: string;
    public nivel!: string;
    public puntos!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Idioma.init(
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
        idioma: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        nivel: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        puntos: {
            type: DataTypes.DECIMAL(4, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'idiomas',
        timestamps: true,
    }
);

Idioma.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Idioma, { foreignKey: 'userId', as: 'idiomas' });

export default Idioma;
