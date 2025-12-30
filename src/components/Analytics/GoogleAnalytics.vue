<script setup lang="ts">
import { config } from '@/config';
import { configure, addGtag } from 'vue-gtag';

const id = config.googleAnalytics.id

if (id) {
  configure({
    tagId: id
  });

  addGtag();
}
</script>


