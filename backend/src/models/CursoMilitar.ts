import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import User from './User';

interface CursoMilitarAttributes {
    id: number;
    userId: number;
    tipo: 'ESPECIALIZACION' | 'INFORMATIVO';
    nombreCurso: string;
    puntos: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CursoMilitarCreationAttributes extends Optional<CursoMilitarAttributes, 'id'> { }

class CursoMilitar extends Model<CursoMilitarAttributes, CursoMilitarCreationAttributes> implements CursoMilitarAttributes {
    public id!: number;
    public userId!: number;
    public tipo!: 'ESPECIALIZACION' | 'INFORMATIVO';
    public nombreCurso!: string;
    public puntos!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CursoMilitar.init(
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
            type: DataTypes.ENUM('ESPECIALIZACION', 'INFORMATIVO'),
            allowNull: false,
        },
        nombreCurso: {
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
        tableName: 'cursos_militares',
        timestamps: true,
    }
);

CursoMilitar.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CursoMilitar, { foreignKey: 'userId', as: 'cursosMilitares' });

export default CursoMilitar;
