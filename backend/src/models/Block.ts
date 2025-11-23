import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '@config/database';
import Theme from './Theme';

interface BlockAttributes {
    id: number;
    code: string;
    name: string;
    description?: string;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BlockCreationAttributes extends Optional<BlockAttributes, 'id'> { }

class Block extends Model<BlockAttributes, BlockCreationAttributes> implements BlockAttributes {
    public id!: number;
    public code!: string;
    public name!: string;
    public description?: string;
    public order!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Block.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'blocks',
        timestamps: true,
    }
);

export default Block;
