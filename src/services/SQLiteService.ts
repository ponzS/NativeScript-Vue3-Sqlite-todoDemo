import SQLiteDatabase from 'nativescript-sqlite';

interface Message {
  id: number;
  content: string;
  created_at: string;
}

export class SQLiteService {
  private db: any = null;
  private dbName = 'talkflow.db';

  async init(): Promise<void> {
    try {
      this.db = await new Promise((resolve, reject) => {
        new SQLiteDatabase(this.dbName, (err: Error, db: any) => {
          if (err) {
            console.error('Failed to open database:', err);
            reject(err);
            return;
          }
          if (!db.isOpen()) {
            console.error('Database is not open');
            reject(new Error('Database is not open'));
            return;
          }
          console.log('Database opened successfully');
          resolve(db);
        });
      });

      await this.db.execSQL(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Messages table created');
    } catch (error) {
      console.error('Database init error:', error);
      throw error;
    }
  }

  async insertMessage(content: string): Promise<number> {
    try {
      if (!this.db || !this.db.isOpen()) {
        throw new Error('Database is not initialized');
      }
      const result = await this.db.execSQL(
        'INSERT INTO messages (content) VALUES (?)',
        [content]
      );
      console.log('Inserted message, ID:', result);
      return result;
    } catch (error) {
      console.error('Insert error:', error);
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      if (!this.db || !this.db.isOpen()) {
        throw new Error('Database is not initialized');
      }
      const rows = await this.db.all('SELECT * FROM messages');
      console.log('Raw query result:', rows);
      return rows.map(([id, content, created_at]: [number, string, string]) => ({
        id,
        content,
        created_at,
      }));
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async updateMessage(id: number, content: string): Promise<void> {
    try {
      if (!this.db || !this.db.isOpen()) {
        throw new Error('Database is not initialized');
      }
      await this.db.execSQL('UPDATE messages SET content = ? WHERE id = ?', [
        content,
        id,
      ]);
      console.log('Updated message ID:', id);
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }

  async deleteMessage(id: number): Promise<void> {
    try {
      if (!this.db || !this.db.isOpen()) {
        throw new Error('Database is not initialized');
      }
      await this.db.execSQL('DELETE FROM messages WHERE id = ?', [id]);
      console.log('Deleted message ID:', id);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.db && this.db.isOpen()) {
        await this.db.close();
        console.log('Database closed');
      }
    } catch (error) {
      console.error('Close error:', error);
      throw error;
    }
  }
}