<script lang="ts">
  let { 
    messages = [], 
    headline = ""
  }: { 
    messages: { sender: 'me' | 'them', text: string }[], 
    headline: string 
  } = $props();
</script>

<div class="w-full h-full bg-[#F5F6F8] p-16 flex flex-col justify-center pb-24">
  <!-- Messages Container -->
  <div class="flex flex-col gap-6 mb-16 mx-auto w-[90%]">
    {#each messages as msg, i (i)}
      <div class="flex {msg.sender === 'me' ? 'justify-end' : 'justify-start'} w-full">
        <div class="
          px-8 py-6 text-[30px] leading-snug max-w-[85%] font-medium tracking-tight shadow-[0_8px_32px_rgba(0,0,0,0.04)]
          {msg.sender === 'me' 
            ? 'bg-[#2D2D35] text-white rounded-[32px] rounded-br-[8px]' 
            : 'bg-white text-[#2D2D35] border border-gray-100 rounded-[32px] rounded-bl-[8px]'}
        ">
          {msg.text}
        </div>
      </div>
    {/each}
  </div>

  <!-- Big PTSD Question -->
  {#if headline}
    <h1 class="text-center text-[56px] leading-[1.1] font-bold text-[#2D2D35] tracking-tight max-w-[95%] mx-auto mt-8">
      {headline}
    </h1>
  {/if}
</div>
