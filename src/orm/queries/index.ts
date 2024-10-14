export const CreateTableQuery = `
    CREATE TABLE IF NOT EXISTS {table_name} (
        {fields}
    )
`

export const InsertQuery = `
   INSERT INTO {table_name} {columns}
   VALUES {values}
`

export const ReadQuery = `
    SELECT * FROM {table_name} {where} {limit} {offset}
`

export const UpdateQuery = `
    UPDATE {table_name} 
    SET {cvalues}
    {where}
`

export const DeleteQuery = `
    DELETE FROM {table_name}
    {where}
`