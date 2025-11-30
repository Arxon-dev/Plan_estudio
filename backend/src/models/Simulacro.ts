import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';

interface SimulacroAttributes {
  id: number;
  title: string;
  description?: string;
  questionIds: number[]; // IDs de las preguntas que componen el simulacro
  timeLimit: number; // En minutos
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SimulacroCreationAttributes extends Optional<SimulacroAttributes, 'id' | 'active'> {}

class Simulacro extends Model<SimulacroAttributes, SimulacroCreationAttributes> implements SimulacroAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public questionIds!: number[];
  public timeLimit!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Simulacro.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    questionIds: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'simulacros',
    timestamps: true,
    underscored: true,
  }
);

export default Simulacro;
