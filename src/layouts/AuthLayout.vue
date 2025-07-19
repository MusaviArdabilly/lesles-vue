<template>
  <div class="relative max-w-md w-full mx-auto bg-[#5bb5e9]">
    <img
      src="/images/illustration/background1.jpg"
      alt="Lesles"
      class="absolute top-0 left-0 w-full h-auto object-cover z-0"
    />
    <img
      src="/images/illustration/background2.png"
      alt="Lesles"
      class="absolute bottom-0 left-1/2 -translate-x-1/2 left-0 w-4/5 h-auto object-cover z-0"
    />

    <div class="relative flex justify-center items-center min-h-dvh p-4 z-10">
      <div class="w-full max-w-sm rounded-lg shadow-lg bg-white p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
