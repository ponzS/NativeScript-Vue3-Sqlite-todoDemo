<template>
  <Frame>
    <Page>
      <ActionBar title="SQLite Demo" />
      <StackLayout>
        <Label v-if="error" :text="error" class="error" />
        <Label v-if="!messages.length && !error" text="No messages yet" class="info" />
        <TextField
          v-model="newMessage"
          hint="Enter message"
          @returnPress="addMessage"
          class="input"
        />
        <Button text="Add Message" @tap="addMessage" />
        <Button text="Refresh Messages" @tap="loadMessages" />
        <ScrollView height="100%">
          <StackLayout>
            <GridLayout
              v-for="message in messages"
              :key="message.id"
              columns="*, auto, auto"
              class="message-item"
            >
              <Label :text="message.content" col="0" class="content" />
              <Button
                text="Update"
                col="1"
                @tap="updateMessage(message.id)"
                class="btn-update"
              />
              <Button
                text="Delete"
                col="2"
                @tap="deleteMessage(message.id)"
                class="btn-delete"
              />
            </GridLayout>
          </StackLayout>
        </ScrollView>
      </StackLayout>
    </Page>
  </Frame>
</template>

<script lang="ts" setup>
// 脚本部分与上面的 Home.vue 相同
import { ref, onMounted, onUnmounted } from 'vue';
import { SQLiteService } from '~/services/SQLiteService';

interface Message {
  id: number;
  content: string;
  created_at: string;
}

const sqliteService = new SQLiteService();
const newMessage = ref('');
const messages = ref<Message[]>([]);
const error = ref('');

onMounted(async () => {
  try {
    await sqliteService.init();
    console.log('Mounted: Database initialized');
    await loadMessages();
  } catch (err) {
    error.value = `Failed to initialize database: ${err.message}`;
    console.error('Mount error:', err);
  }
});

onUnmounted(async () => {
  try {
    await sqliteService.close();
  } catch (err) {
    console.error('Unmount error:', err);
  }
});

async function addMessage() {
  if (!newMessage.value.trim()) return;
  try {
    error.value = '';
    await sqliteService.insertMessage(newMessage.value);
    console.log('Message added:', newMessage.value);
    newMessage.value = '';
    await loadMessages();
  } catch (err) {
    error.value = `Failed to add message: ${err.message}`;
    console.error('Add message error:', err);
  }
}

async function loadMessages() {
  try {
    error.value = '';
    messages.value = await sqliteService.getMessages();
    console.log('Loaded messages:', messages.value);
  } catch (err) {
    error.value = `Failed to load messages: ${err.message}`;
    console.error('Load messages error:', err);
  }
}

async function updateMessage(id: number) {
  const newContent = prompt('Enter new content:', 'Updated message');
  if (!newContent) return;
  try {
    error.value = '';
    await sqliteService.updateMessage(id, newContent);
    await loadMessages();
  } catch (err) {
    error.value = `Failed to update message: ${err.message}`;
    console.error('Update message error:', err);
  }
}

async function deleteMessage(id: number) {
  try {
    error.value = '';
    await sqliteService.deleteMessage(id);
    await loadMessages();
  } catch (err) {
    error.value = `Failed to delete message: ${err.message}`;
    console.error('Delete message error:', err);
  }
}
</script>

<style scoped>
.input {
  margin: 10;
  padding: 10;
  border-bottom-width: 1;
  border-bottom-color: #ccc;
}
.message-item {
  padding: 10;
  border-bottom-width: 1;
  border-bottom-color: #eee;
}
.content {
  font-size: 16;
  vertical-align: middle;
}
.btn-update,
.btn-delete {
  margin: 5;
  padding: 5;
  font-size: 12;
}
.btn-update {
  background-color: #007bff;
  color: white;
}
.btn-delete {
  background-color: #dc3545;
  color: white;
}
.error {
  color: red;
  margin: 10;
  font-size: 14;
}
.info {
  color: gray;
  margin: 10;
  font-size: 14;
  text-align: center;
}
</style>