**Статус:** Approved (17 авг. 2026)

## Критический баг с сильными фризами

Если играть на смартфоне, то спустя 1-2 минуты игра начинает лагать. Ниже тебе предоставлены слепки из DevTools в браузерной версии гугл хром

system / ExternalStringData (36% Retained Size — 8,62 МБ)
Что это: Это текстовые строки (переменные, тяжелые JSON-ответы от сервера, куски исходного кода или шаблонов HTML), которые хранятся вне основной кучи V8, но удерживаются JavaScript-кодом.Где искать проблему: Проверьте кэширование больших объемов текста, повторные запросы к API без очистки старых данных или хранение огромных строк в глобальных переменных.

(string) (52% Retained Size — 12,43 МБ)Что это: Обычные текстовые строки внутри самого JavaScript-движка. Обратите внимание: их собственный размер (Shallow Size) всего 16%, но они удерживают через цепочки ссылок половину всей памяти (Retained Size).Где искать проблему: Скорее всего, эти строки находятся внутри массивов или объектов, которые не могут удалиться из-за забытых обработчиков событий (addEventListener), таймеров (setInterval) или замыканий (closures).

compiled code (68% Retained Size — 16,07 МБ)Что это: Скомпилированный JavaScript-код (функции, замыкания, контексты выполнения).Где искать проблему: Такой высокий процент обычно указывает на динамическое создание большого количества функций (например, внутри циклов) или утечку контекстов замыканий, из-за которых JS-движок вынужден хранить скомпилированный код в памяти.


Во всех трёх категориях 24% сжирает следующий объект
__reactFiber$r3m9ox9remain<div class="road-wet" data-type="road-wet" aria-hidden="true">@73105
6
0.1 kB0 %	1.2 kB0 %	
[3]inblink::LayoutBlockFlow@16912
5
0.1 kB0 %	0.4 kB0 %	
[1]inblink::HeapHashTableBacking<blink::HashTable<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>, blink::KeyValuePair<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>, blink::SizeAndCount>, blink::KeyValuePairExtractor, blink::HashMapValueTraits<blink::HashTraits<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>>, blink::HashTraits<blink::SizeAndCount>>, blink::HashTraits<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>>, blink::HeapAllocator>>@33846
4
0.1 kB0 %	0.1 kB0 %	
[9]inblink::cssvalue::CSSRadialGradientValue@152
3
0.1 kB0 %	0.3 kB0 %	
blink::CSSImageGeneratorValue::CSSImageGeneratorValue(ClassType)@..\..\third_party\blink\renderer\core\css\css_image_generator_value.cc:74inC++ Persistent roots@389329
2
0.0 kB0 %	290 kB1 %	
[29]in(GC roots)@3
1
0.0 kB0 %	23,786 kB100 %	
[1]inblink::StyleGeneratedImage@15188
10
0.1 kB0 %	0.1 kB0 %	
[1]inblink::HeapHashTableBacking<blink::HashTable<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>, blink::KeyValuePair<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>, blink::SizeAndCount>, blink::KeyValuePairExtractor, blink::HashMapValueTraits<blink::HashTraits<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>>, blink::HashTraits<blink::SizeAndCount>>, blink::HashTraits<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>>, blink::HeapAllocator>>@33844
4
0.1 kB0 %	0.1 kB0 %	
[1]inblink::HeapHashTableBacking<blink::HashTable<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>, blink::KeyValuePair<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>, blink::SizeAndCount>, blink::KeyValuePairExtractor, blink::HashMapValueTraits<blink::HashTraits<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>>, blink::HashTraits<blink::SizeAndCount>>, blink::HashTraits<cppgc::internal::BasicMember<const blink::ImageResourceObserver, cppgc::internal::StrongMemberTag, cppgc::internal::DijkstraWriteBarrierPolicy>>, blink::HeapAllocator>>@33842
4
0.1 kB0 %	0.1 kB0 %	
[13]in<div class="road-wet" data-type="road-wet" aria-hidden="true">@73105
6
0.1 kB0 %	1.2 kB0 %	
[2]inblink::LayoutBlockFlow@22340
6
0.1 kB0 %	1.2 kB0 %	
[5]inblink::LayoutBlockFlow@16916
6
0.1 kB0 %	0.3 kB0 %	
[1]inblink::PhysicalBoxFragment@30572
7
0.1 kB0 %	0.1 kB0 %	
[1]inblink::PaintLayer@15618
8
0.1 kB0 %	0.1 kB0 %	
[1]inblink::InlineItem@49720